'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { getCustomerOrders, updateCustomer, WCCustomer, WCOrder, getCustomerByEmail } from '@/lib/api/auth';
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
  const [section, setSection] = useState<Section>(initialSection);
  const [orders, setOrders] = useState<WCOrder[]>([]);
  const [customer, setCustomer] = useState<WCCustomer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const s = searchParams.get('section') as Section;
    if (s && ['info', 'orders', 'addresses', 'password'].includes(s)) {
      setSection(s);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) { router.push('/'); return; }
    const load = async () => {
      setIsLoading(true);
      try {
        const [c, o] = await Promise.all([
          getCustomerByEmail(user.token, user.email),
          getCustomerOrders(user.id),
        ]);
        setCustomer(c);
        setOrders(o);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    load();
  }, [user, router]);

  const handleLogout = () => { logout(); router.push('/'); };
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
      await updateCustomer(customer.id, { first_name: info.first_name, last_name: info.last_name, email: info.email, billing: { ...customer.billing, phone: info.phone } } as any);
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
      await updateCustomer(customer.id, { billing: { ...newAddr } } as any);
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
      await updateCustomer(customer.id, { password: pwd.new } as any);
      notify('Password updated.');
      setPwd({ old: '', new: '', confirm: '' });
    } catch (e: any) { setErrorMsg(e.message); }
    finally { setIsLoading(false); }
  };

  if (!user) return null;

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
                    order.line_items.map((item, i) => (
                      <tr key={`${order.id}-${i}`}>
                        <td>
                          <div className={styles.orderProductCell}>
                            <div style={{ width: 56, height: 56, background: '#f4f4f4', flexShrink: 0 }} />
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td>{item.quantity}</td>
                        <td>{order.currency_symbol}{parseFloat(item.total).toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`${styles.orderStatus} ${getStatusClass(order.status)}`}>
                            {order.status === 'completed' ? 'DELIVERED' : order.status.toUpperCase()}
                          </span>
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
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>First Name <span className={styles.required}>*</span></label>
                <input className={styles.formInput} value={newAddr.first_name} onChange={e => setNewAddr(p => ({...p, first_name: e.target.value}))} placeholder="Mark" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Last Name <span className={styles.required}>*</span></label>
                <input className={styles.formInput} value={newAddr.last_name} onChange={e => setNewAddr(p => ({...p, last_name: e.target.value}))} placeholder="Cole" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email <span className={styles.required}>*</span></label>
                <input className={styles.formInput} type="email" value={newAddr.email} onChange={e => setNewAddr(p => ({...p, email: e.target.value}))} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Number <span className={styles.required}>*</span></label>
                <input className={styles.formInput} type="tel" value={newAddr.phone} onChange={e => setNewAddr(p => ({...p, phone: e.target.value}))} placeholder="+1 0231 4554 452" />
              </div>
              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label className={styles.formLabel}>Address</label>
                <input className={styles.formInput} value={newAddr.address_1} onChange={e => setNewAddr(p => ({...p, address_1: e.target.value}))} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>City <span className={styles.required}>*</span></label>
                <input className={styles.formInput} value={newAddr.city} onChange={e => setNewAddr(p => ({...p, city: e.target.value}))} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>State <span className={styles.required}>*</span></label>
                <select className={styles.formSelect} value={newAddr.state} onChange={e => setNewAddr(p => ({...p, state: e.target.value}))}>
                  {INDIA_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Pincode <span className={styles.required}>*</span></label>
                <input className={styles.formInput} value={newAddr.postcode} onChange={e => setNewAddr(p => ({...p, postcode: e.target.value}))} pattern="[0-9]{6}" />
              </div>
            </div>
            <button className={styles.addAddressBtn} onClick={handleAddAddress} disabled={isLoading}>
              {isLoading ? 'SAVING...' : 'ADD ADDRESS'}
            </button>
          </>
        )}

        {/* CHANGE PASSWORD */}
        {section === 'password' && (
          <>
            <div className={styles.sectionTitle}>Change Password</div>
            <div className={styles.passwordForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Old Password <span className={styles.required}>*</span></label>
                <input className={styles.formInput} type="password" value={pwd.old} onChange={e => setPwd(p => ({...p, old: e.target.value}))} placeholder="Current password" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>New Password <span className={styles.required}>*</span></label>
                <input className={styles.formInput} type="password" value={pwd.new} onChange={e => setPwd(p => ({...p, new: e.target.value}))} placeholder="New password" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Confirm Password <span className={styles.required}>*</span></label>
                <input className={styles.formInput} type="password" value={pwd.confirm} onChange={e => setPwd(p => ({...p, confirm: e.target.value}))} placeholder="Confirm new password" />
              </div>
              <div className={styles.passwordActions}>
                <button className={styles.addAddressBtn} onClick={handleChangePassword} disabled={isLoading}>
                  {isLoading ? 'CHANGING...' : 'CHANGE PASSWORD'}
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
