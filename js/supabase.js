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
      category: spotData.category || 'Ăn Trưa',
      meal_type: spotData.mealType || spotData.meal_type || 'lunch',
      min_price: minPrice,
      max_price: maxPrice,
      distance_minutes: distMins,
      lat: typeof spotData.lat === 'number' ? spotData.lat : null,
      lng: typeof spotData.lng === 'number' ? spotData.lng : null,
      description: String(spotData.description || '').trim(),
      tags: Array.isArray(spotData.tags) ? spotData.tags : [],
      food_images: foodUrls,
      menu_image: menuUrl,
      created_by: user.id
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
