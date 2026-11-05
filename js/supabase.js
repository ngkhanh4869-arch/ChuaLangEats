// Initialize Supabase Client via ESM import
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://qdyxijdscpkezdtpttlo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeXhpamRzY3BrZXpkdHB0dGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0ODQyNzcsImV4cCI6MjEwODA2MDI3N30.teYtRKzI8WlMc6kxOvKK37BdYguKf578fwh_7nmsVVE';

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Alias export to maintain backward compatibility with imports expecting 'supabase'
export const supabase = supabaseClient;

// =============================================================================
// AUTH HELPERS
// =============================================================================

export async function getCurrentUser() {
  try {
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) return { user: null, profile: null, error: authError || null };

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return {
      user,
      profile: profile || { username: user.user_metadata?.username, badge: user.user_metadata?.badge },
      error: profileError || null
    };
  } catch (err) {
    return { user: null, profile: null, error: err };
  }
}

export async function signUpUser(username, password, badge) {
  const cleanUsername = String(username).trim().toLowerCase().replace(/[^a-z0-9._-]/g, '_');
  const syntheticEmail = `${cleanUsername}@chualangeats.user`;

  const { data, error } = await supabaseClient.auth.signUp({
    email: syntheticEmail,
    password: password,
    options: {
      data: {
        username: String(username).trim(),
        badge: badge || 'Sinh Viên Verified'
      }
    }
  });

  return { data, error };
}

export async function signInUser(username, password) {
  const cleanUsername = String(username).trim().toLowerCase().replace(/[^a-z0-9._-]/g, '_');
  const syntheticEmail = `${cleanUsername}@chualangeats.user`;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: syntheticEmail,
    password: password
  });

  return { data, error };
}

export async function signOutUser() {
  const { error } = await supabaseClient.auth.signOut();
  if (!error && typeof window !== 'undefined') {
    window.location.href = 'login.html';
  }
  return { error };
}

// =============================================================================
// STORAGE HELPERS
// =============================================================================

export async function uploadMedia(file, path) {
  const fileExt = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  const { error: uploadError } = await supabaseClient.storage
    .from('spot-media')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabaseClient.storage
    .from('spot-media')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// =============================================================================
// DATA HELPERS
// =============================================================================
// Every function below resolves to a plain { data, error } (or { success, error })
// object and never throws, so every caller can safely do:
//   const { data, error } = await someHelper(...);
//   if (error) { ...handle it...; return; }
// without needing a try/catch to catch rejected auth or database failures.
// (A try/catch around the call is still fine to keep as a second safety net for
// genuinely unexpected errors, e.g. a network drop — it just won't be load-bearing.)

export async function createSpot(spotData, foodFiles = [], menuFile = null) {
  const { user, error: authError } = await getCurrentUser();
  if (!user) {
    return { data: null, error: authError || new Error('Bạn cần đăng nhập để thêm quán.') };
  }

  try {
    // Upload food images
    const foodUrls = [];
    if (Array.isArray(foodFiles)) {
      for (const file of foodFiles) {
        if (file) {
          const url = await uploadMedia(file, 'food');
          foodUrls.push(url);
        }
      }
    }

    // Upload menu image if present
    let menuUrl = null;
    if (menuFile) {
      menuUrl = await uploadMedia(menuFile, 'menu');
    }

    // Handle price parsing safely
    const minPrice = Number(spotData.minPrice ?? spotData.min_price ?? 0);
    const maxPrice = Number(spotData.maxPrice ?? spotData.max_price ?? 0);
    const distMins = Number(spotData.distanceMinutes ?? spotData.distance_minutes ?? 5);

    const payload = {
      name: String(spotData.name || '').trim(),
      address: String(spotData.address || '').trim(),
      category: spotData.category || 'Cơm/Bún/Phở',
      meal_type: spotData.mealType || spotData.meal_type || 'lunch',
      min_price: minPrice,
      max_price: maxPrice,
      distance_minutes: distMins,
      opening_time: spotData.openTime || spotData.opening_time || null,
      closing_time: spotData.closeTime || spotData.closing_time || null,
      lat: typeof spotData.lat === 'number' ? spotData.lat : null,
      lng: typeof spotData.lng === 'number' ? spotData.lng : null,
      description: String(spotData.description || '').trim(),
      tags: Array.isArray(spotData.tags) ? spotData.tags : [],
      food_images: foodUrls,
      menu_image: menuUrl,
      created_by: user.id,
      // Always submit new spots as pending review — never let the client
      // (or a stale DB default) publish a spot straight to the public feed.
      // fetchSpots() only shows status = 'approved', so this is what makes
      // every new spot wait for an admin to approve it in admin.html.
      status: 'pending'
    };

    const { data, error } = await supabaseClient
      .from('spots')
      .insert([payload])
      .select();

    if (error) return { data: null, error };
    return { data: data ? data[0] : null, error: null };
  } catch (err) {
    // Catches uploadMedia() throwing on a storage failure, or any other
    // unexpected exception, and folds it into the normal { data, error } shape.
    return { data: null, error: err };
  }
}

export async function fetchSpots() {
  try {
    const { data, error } = await supabaseClient
      .from('spots')
      .select('*, profiles ( username, badge ), reviews ( quality_rating, hygiene_rating )')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) return { data: [], error };
    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function fetchReviews(spotId) {
  try {
    const { data, error } = await supabaseClient
      .from('reviews')
      .select('*, profiles ( username, badge )')
      .eq('spot_id', spotId)
      .order('created_at', { ascending: false });

    if (error) return { data: [], error };
    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function createReview(reviewData) {
  const { user, error: authError } = await getCurrentUser();
  if (!user) {
    return { data: null, error: authError || new Error('Bạn cần đăng nhập để gửi đánh giá.') };
  }

  const payload = {
    spot_id: reviewData.spot_id ?? reviewData.spotId,
    user_id: user.id,
    quality_rating: reviewData.quality_rating ?? reviewData.qualityRating ?? null,
    hygiene_rating: reviewData.hygiene_rating ?? reviewData.hygieneRating ?? null,
    price_paid: reviewData.price_paid ?? reviewData.pricePaid ?? null,
    comment: reviewData.comment ? String(reviewData.comment).trim() : null,
  };

  try {
    const { data, error } = await supabaseClient
      .from('reviews')
      .insert([payload])
      .select();

    if (error) return { data: null, error };
    return { data: data ? data[0] : null, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function reportItem(type, itemId, reason) {
  const { user, error: authError } = await getCurrentUser();
  if (!user) {
    return { data: null, error: authError || new Error('Bạn cần đăng nhập để gửi báo cáo.') };
  }

  if (type !== 'spot' && type !== 'review') {
    return { data: null, error: new Error(`Loại báo cáo không hợp lệ: "${type}".`) };
  }

  const payload = {
    reported_by: user.id,
    reason: String(reason || '').trim(),
    spot_id: type === 'spot' ? itemId : null,
    review_id: type === 'review' ? itemId : null,
  };

  try {
    const { data, error } = await supabaseClient
      .from('reports')
      .insert([payload])
      .select();

    if (error) return { data: null, error };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function deleteItem(type, itemId) {
  const { user, error: authError } = await getCurrentUser();
  if (!user) {
    return { success: false, error: authError || new Error('Bạn không có quyền xóa mục này.') };
  }

  if (type !== 'spot' && type !== 'review') {
    return { success: false, error: new Error(`Loại mục không hợp lệ: "${type}".`) };
  }

  const table = type === 'spot' ? 'spots' : 'reviews';

  try {
    const { error } = await supabaseClient
      .from(table)
      .delete()
      .eq('id', itemId);

    if (error) return { success: false, error };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err };
  }
}

// =============================================================================
// ADMIN HELPERS
// =============================================================================
// Every call below is still gated server-side by the admin RLS policies
// (see the SQL migration) — a non-admin account gets a Postgres permission
// error back, regardless of whether admin.html is reachable.

export async function fetchAdminOverview() {
  try {
    const count = async (table, status) => {
      let q = supabaseClient.from(table).select('*', { count: 'exact', head: true });
      if (status) q = q.eq('status', status);
      const { count, error } = await q;
      if (error) throw error;
      return count ?? 0;
    };

    const [totalSpots, pendingSpots, pendingReports, totalUsers] = await Promise.all([
      count('spots'),
      count('spots', 'pending'),
      count('reports', 'pending'),
      count('profiles'),
    ]);

    return { data: { totalSpots, pendingSpots, pendingReports, totalUsers }, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function fetchAdminAnalytics() {
  try {
    const [reviewsRes, resolvedRes, categoryRes, reasonRes] = await Promise.all([
      supabaseClient.from('reviews').select('*', { count: 'exact', head: true }),
      supabaseClient.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
      supabaseClient.from('spots').select('category').limit(500),
      supabaseClient.from('reports').select('reason').limit(500),
    ]);
    if (reviewsRes.error) throw reviewsRes.error;
    if (resolvedRes.error) throw resolvedRes.error;
    if (categoryRes.error) throw categoryRes.error;
    if (reasonRes.error) throw reasonRes.error;

    const tally = (rows, key) => {
      const counts = new Map();
      (rows || []).forEach((row) => counts.set(row[key], (counts.get(row[key]) || 0) + 1));
      return Array.from(counts, ([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
    };

    return {
      data: {
        totalReviews: reviewsRes.count ?? 0,
        resolvedReports: resolvedRes.count ?? 0,
        categoryBreakdown: tally(categoryRes.data, 'category'),
        reasonBreakdown: tally(reasonRes.data, 'reason'),
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err };
  }
}

export async function fetchUsers(query = '') {
  try {
    let q = supabaseClient
      .from('profiles')
      .select('id, username, email, role, is_banned, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    const trimmed = String(query || '').trim();
    if (trimmed) {
      q = q.or(`username.ilike.%${trimmed}%,email.ilike.%${trimmed}%`);
    }

    const { data, error } = await q;
    if (error) return { data: [], error };
    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function setUserBanned(userId, banned) {
  try {
    const { error } = await supabaseClient.from('profiles').update({ is_banned: banned }).eq('id', userId);
    if (error) return { success: false, error };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function setUserRole(userId, role) {
  if (role !== 'admin' && role !== 'user') {
    return { success: false, error: new Error(`Quyền không hợp lệ: "${role}".`) };
  }
  try {
    const { error } = await supabaseClient.from('profiles').update({ role }).eq('id', userId);
    if (error) return { success: false, error };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function fetchPendingReports() {
  try {
    const { data, error } = await supabaseClient
      .from('reports')
      .select(
        'id, reason, status, created_at, spot_id, review_id, spots:spot_id(id, name, address), reviews:review_id(id, comment, spot_id)'
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) return { data: [], error };
    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function resolveReport(reportId) {
  try {
    const { error } = await supabaseClient.from('reports').update({ status: 'resolved' }).eq('id', reportId);
    if (error) return { success: false, error };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err };
  }
}

export async function fetchPendingSpots() {
  try {
    const { data, error } = await supabaseClient
      .from('spots')
      .select('id, name, address, category, status, created_at, created_by')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(100);
    if (error) return { data: [], error };
    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: err };
  }
}

export async function approveSpot(spotId) {
  try {
    const { error } = await supabaseClient.from('spots').update({ status: 'approved' }).eq('id', spotId);
    if (error) return { success: false, error };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err };
  }
}
