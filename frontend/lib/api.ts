export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:7001';
export const API_URL = `${BASE_URL}/api`;

export async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}


export async function fetchProductById(id: string) {
  const res = await fetch(`${API_URL}/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

export async function login(credentials: any) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Invalid credentials');
  }
  return res.json();
}

export async function signup(userData: any) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Could not create account');
  }
  return res.json();
}

export async function verifyOtp(email: string, otp: string) {
  const res = await fetch(`${API_URL}/auth/verify-otp/${email}/${otp}`);
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Verification failed');
  }
  return res.json();
}

export async function forgotPassword(email: string) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to send reset code');
  }
  return res.json();
}

export async function resetPassword(data: any) {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to reset password');
  }
  return res.json();
}

export async function createProduct(formData: FormData, token: string) {
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });
  if (res.status === 401 || res.status === 403) throw new Error('401 Unauthorized - session expired');
  if (!res.ok) throw new Error(`Failed to create product (${res.status})`);
  return res.json();
}

export async function deleteProduct(id: string, token: string) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.json();
}

export async function addReview(id: string, rating: number, comment: string, token: string, name?: string) {
  const res = await fetch(`${API_URL}/products/${id}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ rating, comment, name })
  });
  if (!res.ok) {
    let errorMsg = 'Failed to add review';
    try {
      const errorData = await res.json();
      errorMsg = errorData.message || errorMsg;
    } catch (e) {
      errorMsg = `Server error ${res.status}`;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}
export async function fetchStats(token: string) {
  const res = await fetch(`${API_URL}/analytics/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchSalesByCountry(token: string) {
  const res = await fetch(`${API_URL}/analytics/country-stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch country stats');
  return res.json();
}

// Blog API
export async function fetchBlogs() {
  const res = await fetch(`${API_URL}/blogs`);
  if (!res.ok) throw new Error('Failed to fetch blogs');
  return res.json();
}

export async function fetchBlogById(id: string) {
  const res = await fetch(`${API_URL}/blogs/${id}`);
  if (!res.ok) throw new Error('Failed to fetch blog');
  return res.json();
}

export async function createBlog(formData: FormData, token: string) {
  const res = await fetch(`${API_URL}/blogs`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to publish blog');
  return res.json();
}

export async function deleteBlog(id: string, token: string) {
  const res = await fetch(`${API_URL}/blogs/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete blog');
  return res.json();
}

// User Dashboard API
export async function fetchUserProfile(token: string) {
  const res = await fetch(`${API_URL}/user/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

export async function fetchUserOrders(token: string) {
  const res = await fetch(`${API_URL}/user/orders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch user orders');
  return res.json();
}

// Affiliate API
export async function applyAffiliate(data: any) {
  const res = await fetch(`${API_URL}/affiliates/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to submit application');
  }
  return res.json();
}

export async function fetchAffiliateApplications(token: string) {
  const res = await fetch(`${API_URL}/affiliates/applications`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch affiliate applications');
  return res.json();
}

export async function approveAffiliateApplication(id: string, token: string) {
  const res = await fetch(`${API_URL}/affiliates/approve/${id}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to approve application');
  return res.json();
}
