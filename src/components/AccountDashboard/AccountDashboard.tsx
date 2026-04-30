'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signOut as nextAuthSignOut } from 'next-auth/react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { WCCustomer, WCOrder } from '@/lib/api/auth';
import styles from './AccountDashboard.module.css';

type Section = 'info' | 'orders' | 'addresses' | 'password';

const INDIA_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
  'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh','Puducherry',
];

export const AccountDashboard: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSection = (searchParams.get('section') as Section) || 'info';
  
  const { user, logout } = useAuthStore();
  const { openLoginModal } = useUIStore();
  const [section, setSection] = useState<Section>(initialSection);
  const [orders, setOrders] = useState<WCOrder[]>([]);
  const [customer, setCustomer] = useState<WCCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState<string | null>(null);
  const [orderTypeTab, setOrderTypeTab] = useState<'wallpaper' | 'decor'>('wallpaper');

  useEffect(() => {
    const s = searchParams.get('section') as Section;
    if (s && ['info', 'orders', 'addresses', 'password'].includes(s)) {
      setSection(s);
    }
  }, [searchParams]);

  // Detect guest order flag from localStorage
  useEffect(() => {
    const email = localStorage.getItem('fr_guest_order_email');
    if (email) {
      if (user) {
        // User is now logged in — clear the guest flag
        localStorage.removeItem('fr_guest_order_email');
      } else {
        setGuestEmail(email);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const [custRes, ordersRes] = await Promise.all([
          fetch(`/api/wc/customer?email=${encodeURIComponent(user.email)}`),
          fetch(`/api/wc/orders?customer_id=${user.id}`),
        ]);
        if (custRes.ok) setCustomer(await custRes.json());
        if (ordersRes.ok) setOrders(await ordersRes.json());
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    load();
  }, [user, router]);

  const handleLogout = () => { 
    logout(); 
    nextAuthSignOut({ redirect: false }).catch(() => {});
    router.push('/'); 
  };
  const notify = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3000); };

  // ── Account Info ──
  const [info, setInfo] = useState({ first_name: '', last_name: '', email: '', phone: '' });
  useEffect(() => {
    if (customer) setInfo({ first_name: customer.first_name, last_name: customer.last_name, email: customer.email, phone: customer.billing?.phone || '' });
  }, [customer]);

  const handleSaveInfo = async () => {
    if (!customer) return;
    setIsLoading(true); setErrorMsg(null);
    try {
      const res = await fetch(`/api/wc/customer?id=${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: info.first_name, last_name: info.last_name, email: info.email, billing: { ...customer.billing, phone: info.phone } }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Update failed');
      notify('Account info updated.');
    } catch (e: any) { setErrorMsg(e.message); }
    finally { setIsLoading(false); }
  };

  // ── Addresses ──
  const [newAddr, setNewAddr] = useState({ first_name: '', last_name: '', email: '', phone: '', address_1: '', city: '', state: 'Jharkhand', postcode: '' });

  const handleAddAddress = async () => {
    if (!customer) return;
    setIsLoading(true); setErrorMsg(null);
    try {
      const res = await fetch(`/api/wc/customer?id=${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billing: { ...newAddr } }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to add address');
      notify('Address added.');
      setNewAddr({ first_name: '', last_name: '', email: '', phone: '', address_1: '', city: '', state: 'Jharkhand', postcode: '' });
    } catch (e: any) { setErrorMsg(e.message); }
    finally { setIsLoading(false); }
  };

  // ── Password ──
  const [pwd, setPwd] = useState({ old: '', new: '', confirm: '' });
  const handleChangePassword = async () => {
    if (!customer) return;
    if (pwd.new !== pwd.confirm) { setErrorMsg('Passwords do not match.'); return; }
    setIsLoading(true); setErrorMsg(null);
    try {
      const res = await fetch(`/api/wc/customer?id=${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd.new }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to change password');
      notify('Password updated.');
      setPwd({ old: '', new: '', confirm: '' });
    } catch (e: any) { setErrorMsg(e.message); }
    finally { setIsLoading(false); }
  };

  if (!user) {
    return (
      <div style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', fontFamily: 'var(--font-sans)', color: '#333', padding: '2rem' }}>
        
        {/* Guest order temporary password notice */}
        {guestEmail && (
          <div style={{
            maxWidth: '540px', width: '100%',
            border: '1px solid #e8d5b7',
            background: '#fffbf5',
            padding: '1.5rem 2rem',
            borderRadius: '2px',
            marginBottom: '0.5rem',
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>✉️</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.4rem', color: '#1a1a1a' }}>
                  Your account with First Room is using a temporary password.
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.6 }}>
                  We emailed a link to <strong>{guestEmail}</strong> to change your password.
                  Once set, you can log in to view your orders and manage your account.
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1rem' }}>
            {guestEmail ? 'Already set your password? Log in below.' : 'You need to be logged in to view your account.'}
          </div>
          <button
            onClick={openLoginModal}
            style={{ background: '#111', color: '#fff', border: 'none', padding: '0.85rem 2.5rem', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '1.5px', cursor: 'pointer' }}
          >
            LOGIN
          </button>
        </div>
      </div>
    );
  }

  const navItems: { id: Section; label: string }[] = [
    { id: 'info', label: 'Account info' },
    { id: 'orders', label: 'My order' },
    { id: 'addresses', label: 'My address' },
    { id: 'password', label: 'Change password' },
  ];

  const getStatusClass = (s: string) => {
    if (s === 'completed' || s === 'delivered') return styles.statusDelivered;
    if (s === 'processing') return styles.statusProcessing;
    if (s === 'cancelled') return styles.statusCancelled;
    return styles.statusPending;
  };

  return (
    <div className={styles.layout}>
      {/* ─── SIDEBAR ─── */}
      <aside className={styles.sidebar}>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{user.firstName} {user.lastName}</div>
          <div className={styles.userEmail}>{user.email}</div>
        </div>
        <nav className={styles.navList}>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`${styles.navItem} ${section === item.id ? styles.navItemActive : ''}`}
              onClick={() => { setSection(item.id); setSuccessMsg(null); setErrorMsg(null); }}
            >
              {item.label}
            </button>
          ))}
          <button className={`${styles.navItem} ${styles.logoutItem}`} onClick={handleLogout}>
            Log Out
          </button>
        </nav>
      </aside>

      {/* ─── MAIN ─── */}
      <main className={styles.main}>
        {successMsg && <div className={styles.successMsg}>{successMsg}</div>}
        {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

        {/* ACCOUNT INFO */}
        {section === 'info' && (
          <>
            <div className={styles.sectionTitle}>Account Info</div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>First Name <span className={styles.required}>*</span></label>
                <input className={styles.formInput} value={info.first_name} onChange={e => setInfo(p => ({...p, first_name: e.target.value}))} placeholder="First name" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Last Name <span className={styles.required}>*</span></label>
                <input className={styles.formInput} value={info.last_name} onChange={e => setInfo(p => ({...p, last_name: e.target.value}))} placeholder="Last name" />
              </div>
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.formLabel}>Email Address <span className={styles.required}>*</span></label>
                <input className={styles.formInput} type="email" value={info.email} onChange={e => setInfo(p => ({...p, email: e.target.value}))} />
              </div>
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.formLabel}>Phone Number <span className={styles.optional}>(Optional)</span></label>
                <input className={styles.formInput} type="tel" value={info.phone} onChange={e => setInfo(p => ({...p, phone: e.target.value}))} placeholder="+91 XXXXXXXXXX" />
              </div>
            </div>
            <button className={styles.saveBtn} onClick={handleSaveInfo} disabled={isLoading}>
              {isLoading ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
          </>
        )}

        {/* MY ORDERS */}
        {section === 'orders' && (
          <>
            <div className={styles.sectionTitle}>My Orders</div>
            
            {/* Order Type Tabs */}
            <div className={styles.orderTabs}>
              <button 
                className={`${styles.orderTab} ${orderTypeTab === 'wallpaper' ? styles.orderTabActive : ''}`}
                onClick={() => setOrderTypeTab('wallpaper')}
              >
                Wallpaper
              </button>
              <button 
                className={`${styles.orderTab} ${orderTypeTab === 'decor' ? styles.orderTabActive : ''}`}
                onClick={() => setOrderTypeTab('decor')}
              >
                Home Decor
              </button>
            </div>

            {isLoading ? <p>Loading…</p> : orders.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No orders yet.</p>
                <Link href="/" style={{ color: 'var(--accent-color)', marginTop: '1rem', display: 'inline-block' }}>Start shopping →</Link>
              </div>
            ) : (
              <table className={styles.ordersTable}>
                <thead>
                  <tr>
                    <th>PRODUCTS</th>
                    <th>QUANTITY</th>
                    <th>PRICE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.flatMap(order =>
                    order.line_items
                      .filter(item => {
                        const isWall = item.sku?.startsWith('FMWPAR') || 
                                      item.meta_data?.some(m => m.key.toLowerCase() === 'area') ||
                                      item.name.toLowerCase().includes('shade');
                        return orderTypeTab === 'wallpaper' ? isWall : !isWall;
                      })
                      .map((item, i) => (
                        <tr key={`${order.id}-${i}`}>
                        <td data-label="Product">
                          <div className={styles.orderProductCell}>
                            <div className={styles.orderImagePlaceholder}>
                              {item.image?.src ? (
                                <img src={item.image.src} alt={item.name} className={styles.orderItemImage} />
                              ) : (
                                <div className={styles.noImage}>FR</div>
                              )}
                            </div>
                            <div className={styles.orderItemDetails}>
                              <span className={styles.orderItemName}>{item.name}</span>
                              <span className={styles.orderDate}>{new Date(order.date_created).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              
                              {/* Display custom dimensions and material */}
                              {item.meta_data && item.meta_data.length > 0 && (
                                <div className={styles.orderItemMeta}>
                                  {item.meta_data
                                    .filter(m => !['area', '_custom_data', 'sqft'].includes(m.key.toLowerCase()))
                                    .map((meta, idx) => (
                                      <div key={idx} className={styles.orderMetaRow}>
                                        {meta.key}: {meta.value}
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td data-label="Quantity">
                          {/* Hide quantity for wallpapers in order history to avoid confusion */}
                          {(item.meta_data?.some(m => m.key.toLowerCase() === 'area') || (item.sku && item.sku.startsWith('FMWPAR'))) ? '-' : item.quantity}
                        </td>
                        <td data-label="Price">{order.currency_symbol}{parseFloat(item.total).toLocaleString('en-IN')}</td>
                        <td data-label="Status">
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
                              {order.status === 'completed' ? 'DELIVERED' : order.status.toUpperCase()}
                            </span>
                            <Link href={`/thank-you?order_id=${order.id}`} className={styles.viewDetailsBtn}>
                              VIEW DETAILS
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* MY ADDRESS */}
        {section === 'addresses' && customer && (
          <>
            <div className={styles.sectionTitle}>My Address</div>
            <div className={styles.addressList}>
              {customer.billing?.address_1 && (
                <div className={styles.addressRow}>
                  <div>
                    <div className={styles.addressName}>{customer.billing.first_name} {customer.billing.last_name}</div>
                    <div className={styles.addressText}>{customer.billing.address_1}, {customer.billing.city}, {customer.billing.state} {customer.billing.postcode}</div>
                  </div>
                  <div className={styles.addressActions}>
                    <button className={styles.editBtn}>EDIT</button>
                    <button className={styles.removeBtn}>REMOVE</button>
                  </div>
                </div>
              )}
              {customer.shipping?.address_1 && (
                <div className={styles.addressRow}>
                  <div>
                    <div className={styles.addressName}>{customer.shipping.first_name} {customer.shipping.last_name}</div>
                    <div className={styles.addressText}>{customer.shipping.address_1}, {customer.shipping.city}, {customer.shipping.state} {customer.shipping.postcode}</div>
                  </div>
                  <div className={styles.addressActions}>
                    <button className={styles.editBtn}>EDIT</button>
                    <button className={styles.removeBtn}>REMOVE</button>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.addAddressTitle}>Add New Address</div>
            <div className={styles.addressFormGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>First Name <span className={styles.required}>*</span></label>
                <input className={styles.formInput} value={newAddr.first_name} onChange={e => setNewAddr(p => ({...p, first_name: e.target.value}))} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Last Name <span className={styles.required}>*</span></label>
                <input className={styles.formInput} value={newAddr.last_name} onChange={e => setNewAddr(p => ({...p, last_name: e.target.value}))} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email <span className={styles.required}>*</span></label>
                <input className={styles.formInput} type="email" value={newAddr.email} onChange={e => setNewAddr(p => ({...p, email: e.target.value}))} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Number <span className={styles.required}>*</span></label>
                <input className={styles.formInput} type="tel" value={newAddr.phone} onChange={e => setNewAddr(p => ({...p, phone: e.target.value}))} />
              </div>
            </div>
            <div className={styles.formGroup} style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <label className={styles.formLabel}>Address</label>
              <input className={styles.formInput} value={newAddr.address_1} onChange={e => setNewAddr(p => ({...p, address_1: e.target.value}))} />
            </div>
            <div className={styles.addressFormRow3}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>City <span className={styles.required}>*</span></label>
                <input className={styles.formInput} value={newAddr.city} onChange={e => setNewAddr(p => ({...p, city: e.target.value}))} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>State <span className={styles.required}>*</span></label>
                <select className={styles.formSelect} value={newAddr.state} onChange={e => setNewAddr(p => ({...p, state: e.target.value}))}>
                  {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Pincode <span className={styles.required}>*</span></label>
                <input className={styles.formInput} value={newAddr.postcode} onChange={e => setNewAddr(p => ({...p, postcode: e.target.value}))} />
              </div>
            </div>
            <button className={styles.addAddressBtn} onClick={handleAddAddress} disabled={isLoading}>
              {isLoading ? 'ADDING...' : 'ADD ADDRESS'}
            </button>
          </>
        )}

        {/* CHANGE PASSWORD */}
        {section === 'password' && customer && (
          <>
            <div className={styles.sectionTitle}>Change Password</div>
            <div className={styles.passwordForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Old Password <span className={styles.required}>*</span></label>
                <input className={styles.formInput} type="password" value={pwd.old} onChange={e => setPwd(p => ({...p, old: e.target.value}))} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>New Password <span className={styles.required}>*</span></label>
                <input className={styles.formInput} type="password" value={pwd.new} onChange={e => setPwd(p => ({...p, new: e.target.value}))} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Confirm Password <span className={styles.required}>*</span></label>
                <input className={styles.formInput} type="password" value={pwd.confirm} onChange={e => setPwd(p => ({...p, confirm: e.target.value}))} />
              </div>
              <div className={styles.passwordActions}>
                <button className={styles.saveBtn} onClick={handleChangePassword} disabled={isLoading} style={{ marginTop: 0 }}>
                  {isLoading ? 'UPDATING...' : 'CHANGE PASSWORD'}
                </button>
                <button className={styles.forgotLink}>Forgot Password</button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
