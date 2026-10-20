// Initialize Supabase Client via ESM import
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://qdyxijdscpkezdtpttlo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeXhpamRzY3BrZXpkdHB0dGxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0ODQyNzcsImV4cCI6MjEwODA2MDI3N30.teYtRKzI8WlMc6kxOvKK37BdYguKf578fwh_7nmsVVE';

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper Functions
export async function getCurrentUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return null;
  
  const { data: profile } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  return { ...user, profile };
}

export async function signUpUser(username, password, badge) {
  const syntheticEmail = `${username.toLowerCase().trim()}@chualangeats.user`;
  
  const { data, error } = await supabaseClient.auth.signUp({
    email: syntheticEmail,
    password: password,
    options: {
      data: {
        username: username.trim(),
        badge: badge || 'Sinh Viên Verified'
      }
    }
  });
  
  return { data, error };
}

export async function signInUser(username, password) {
  const syntheticEmail = `${username.toLowerCase().trim()}@chualangeats.user`;
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: syntheticEmail,
    password: password
  });
  
  return { data, error };
}

export async function signOutUser() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
}

export async function uploadMedia(file, path) {
  const fileExt = file.name.split('.').pop();
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

export async function createSpot(spotData, foodFiles, menuFile) {
  const user = await getCurrentUser();
  if (!user) throw new Error(" Bạn cần đăng nhập để thêm quán.");

  const foodUrls = [];
  for (const file of foodFiles) {
    const url = await uploadMedia(file, 'food');
    foodUrls.push(url);
  }

  let menuUrl = null;
  if (menuFile) {
    menuUrl = await uploadMedia(menuFile, 'menus');
  }

  const { data, error } = await supabaseClient
    .from('spots')
    .insert([{
      name: spotData.name,
      address: spotData.address,
      category: spotData.category,
      meal_type: spotData.mealType || 'lunch',
      min_price: parseInt(spotData.minPrice),
      max_price: parseInt(spotData.maxPrice),
      distance_minutes: parseInt(spotData.distanceMinutes || 5),
      description: spotData.description,
      tags: spotData.tags || [],
      food_images: foodUrls,
      menu_image: menuUrl,
      created_by: user.id
    }])
    .select();

  if (error) throw error;
  return data[0];
}

export async function fetchSpots() {
  const { data, error } = await supabaseClient
    .from('spots')
    .select('*, profiles ( username, badge ), reviews ( quality_rating, hygiene_rating )')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function reportItem(type, itemId, reason) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Bạn cần đăng nhập để gửi báo cáo.");

  const payload = {
    reported_by: user.id,
    reason: reason
  };

  if (type === 'spot') payload.spot_id = itemId;
  if (type === 'review') payload.review_id = itemId;

  const { data, error } = await supabaseClient
    .from('reports')
    .insert([payload]);

  if (error) throw error;
  return data;
}

export async function deleteItem(type, itemId) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Bạn không có quyền xóa mục này.");

  const table = type === 'spot' ? 'spots' : 'reviews';
  const { error } = await supabaseClient
    .from(table)
    .delete()
    .eq('id', itemId);

  if (error) throw error;
  return true;
}
