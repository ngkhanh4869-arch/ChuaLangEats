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

export async function createSpot(spotData, foodFiles = [], menuFile = null) {
  const { user } = await getCurrentUser();
  if (!user) throw new Error("Bạn cần đăng nhập để thêm quán.");

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
    menuUrl = await uploadMedia(menuFile, 'menus');
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
}

export async function fetchSpots() {
  const { data, error } = await supabaseClient
    .from('spots')
    .select('*, profiles ( username, badge ), reviews ( quality_rating, hygiene_rating )')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) return { data: [], error };
  return { data: data || [], error: null };
}

export async function reportItem(type, itemId, reason) {
  const { user } = await getCurrentUser();
  if (!user) throw new Error("Bạn cần đăng nhập để gửi báo cáo.");

  const payload = {
    reported_by: user.id,
    reason: String(reason || '').trim()
  };

  if (type === 'spot') payload.spot_id = itemId;
  if (type === 'review') payload.review_id = itemId;

  const { data, error } = await supabaseClient
    .from('reports')
    .insert([payload])
    .select();

  if (error) return { data: null, error };
  return { data, error: null };
}

export async function deleteItem(type, itemId) {
  const { user } = await getCurrentUser();
  if (!user) throw new Error("Bạn không có quyền xóa mục này.");

  const table = type === 'spot' ? 'spots' : 'reviews';
  const { error } = await supabaseClient
    .from(table)
    .delete()
    .eq('id', itemId);

  if (error) return { success: false, error };
  return { success: true, error: null };
}
