export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:7001';
export const API_URL = `${BASE_URL}/api`;

export async function fetchProducts(params?: {
  category?: string;
  search?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  sortBy?: string;
  type?: string;
  freeOnly?: string | boolean;
}) {
  try {
    let url = `${API_URL}/products`;
    if (params) {
      const qParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          qParams.append(key, String(val));
        }
      });
      const queryString = qParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    const res = await fetch(url, { cache: 'no-store' });
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
  if (!res.ok) {
    let msg = `Failed to create product (${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch {}
    throw new Error(msg);
  }
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

// ───── Transactions API ─────

export async function fetchTransactions(token: string) {
  const res = await fetch(`${API_URL}/transactions`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

// ==================== SELLER API ====================

export async function fetchSellerAnalytics(token: string, timeRange: string = 'all') {
  const res = await fetch(`${API_URL}/seller/analytics?timeRange=${timeRange}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch seller analytics');
  return res.json();
}

export async function addPaymentMethod(token: string, type: string, details: string) {
  const res = await fetch(`${API_URL}/seller/payment-methods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ type, details })
  });
  if (!res.ok) throw new Error('Failed to add payment method');
  return res.json();
}

export async function purchaseVerification(token: string, tier: string, paymentId: string = 'simulated_txn') {
  const res = await fetch(`${API_URL}/seller/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ tier, paymentId })
  });
  if (!res.ok) throw new Error('Failed to purchase verification');
  return res.json();
}

export async function updateSellerProfile(token: string, formData: FormData) {
  const res = await fetch(`${API_URL}/seller/profile`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  if (!res.ok) throw new Error('Failed to update seller profile');
  return res.json();
}

export async function fetchSellerShop(id: string) {
  const res = await fetch(`${API_URL}/seller/shop/${id}`);
  if (!res.ok) throw new Error('Failed to fetch seller shop profile');
  return res.json();
}

export async function becomeSeller(token: string) {
  const res = await fetch(`${API_URL}/user/become-seller`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized');
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to upgrade to seller');
  }
  return res.json();
}

// ───── Chat API ─────

export async function fetchMyChat(token: string) {
  const res = await fetch(`${API_URL}/chat/my-chat`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch chat');
  return res.json();
}

export async function sendChatMessage(token: string, text: string, mediaFile?: File, productId?: string) {
  const formData = new FormData();
  if (text) formData.append('text', text);
  if (mediaFile) formData.append('media', mediaFile);
  if (productId) formData.append('productId', productId);

  const res = await fetch(`${API_URL}/chat/my-chat/send`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Server Error (${res.status}): ${errorText}`);
  }
  return res.json();
}

export async function markChatRead(token: string) {
  const res = await fetch(`${API_URL}/chat/my-chat/read`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to mark read');
  return res.json();
}

// Admin chat endpoints
export async function fetchAllChats(token: string) {
  const res = await fetch(`${API_URL}/chat/all`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch chats');
  return res.json();
}

export async function fetchChatById(chatId: string, token: string) {
  const res = await fetch(`${API_URL}/chat/${chatId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch chat');
  return res.json();
}

export async function adminReplyChat(chatId: string, token: string, text: string, mediaFile?: File) {
  const formData = new FormData();
  if (text) formData.append('text', text);
  if (mediaFile) formData.append('media', mediaFile);

  const res = await fetch(`${API_URL}/chat/${chatId}/reply`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  if (!res.ok) throw new Error('Failed to send reply');
  return res.json();
}

export async function adminMarkChatRead(chatId: string, token: string) {
  const res = await fetch(`${API_URL}/chat/${chatId}/read`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to mark read');
  return res.json();
}

export async function adminCloseChat(chatId: string, token: string) {
  const res = await fetch(`${API_URL}/chat/${chatId}/close`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to close chat');
  return res.json();
}
