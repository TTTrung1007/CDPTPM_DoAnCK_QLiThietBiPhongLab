import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState([]);

  const loadWishlist = useCallback(async () => {
    try {
      const userData = localStorage.getItem('userInfo');
      if (!userData) return;
      const user = JSON.parse(userData);
      const { data } = await axios.get('http://localhost:5000/api/users/wishlist', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setWishlistIds(data.map(id => id.toString()));
    } catch (e) {
      // ignore - user might not be logged in
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const toggleWishlist = useCallback(async (equipmentId) => {
    try {
      const userData = localStorage.getItem('userInfo');
      if (!userData) return;
      const user = JSON.parse(userData);
      await axios.put(`http://localhost:5000/api/users/wishlist/${equipmentId}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setWishlistIds(prev =>
        prev.includes(equipmentId)
          ? prev.filter(id => id !== equipmentId)
          : [...prev, equipmentId]
      );
    } catch (e) {
      console.error('Wishlist error:', e);
    }
  }, []);

  const isWishlisted = useCallback((id) => wishlistIds.includes(id?.toString()), [wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isWishlisted, count: wishlistIds.length, reload: loadWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
