// Shared Footer Component — injects full footer on all pages
(function() {
  const footerHTML = `
  <footer style="background:#2E3B28;color:rgba(255,255,255,0.7);padding:60px 80px 0;">
    <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:40px;margin-bottom:40px;">
      <div>
        <a href="index.html" style="font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:600;color:#EDEAE3;text-decoration:none;display:block;margin-bottom:16px;">Spec <span style="color:#A3B88A;">Interior</span></a>
        <p style="font-size:14px;line-height:1.8;max-width:280px;margin-bottom:24px;color:rgba(255,255,255,0.6);">Handcrafted cane lamps and wall décor celebrating the richness of Indian artisanship. Every piece made with love, light, and intention.</p>
        <div style="display:flex;gap:12px;">
          <a href="https://www.instagram.com/spec_interior/" target="_blank" style="width:36px;height:36px;background:rgba(255,255,255,0.08);border-radius:50%;display:flex;align-items:center;justify-content:center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
          <a href="https://wa.me/919654535236" target="_blank" style="width:36px;height:36px;background:rgba(255,255,255,0.08);border-radius:50%;display:flex;align-items:center;justify-content:center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg></a>
        </div>
      </div>
      <div>
        <h4 style="font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#EDEAE3;margin-bottom:20px;">Shop</h4>
        <ul style="list-style:none;display:flex;flex-direction:column;gap:10px;">
          <li><a href="category.html?cat=lamp" style="color:rgba(255,255,255,0.65);text-decoration:none;font-size:14px;">Cane Lamps</a></li>
          <li><a href="category.html?cat=wall" style="color:rgba(255,255,255,0.65);text-decoration:none;font-size:14px;">Wall Decor</a></li>
          <li><a href="category.html?cat=pendant" style="color:rgba(255,255,255,0.65);text-decoration:none;font-size:14px;">Pendant Lights</a></li>
          <li><a href="category.html?cat=standing" style="color:rgba(255,255,255,0.65);text-decoration:none;font-size:14px;">Standing Lamps</a></li>
          <li><a href="category.html?cat=gifting" style="color:rgba(255,255,255,0.65);text-decoration:none;font-size:14px;">Gifting Sets</a></li>
        </ul>
      </div>
      <div>
        <h4 style="font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#EDEAE3;margin-bottom:20px;">Company</h4>
        <ul style="list-style:none;display:flex;flex-direction:column;gap:10px;">
          <li><a href="blog.html" style="color:rgba(255,255,255,0.65);text-decoration:none;font-size:14px;">Blog</a></li>
          <li><a href="contact.html" style="color:rgba(255,255,255,0.65);text-decoration:none;font-size:14px;">Contact Us</a></li>
          <li><a href="track.html" style="color:rgba(255,255,255,0.65);text-decoration:none;font-size:14px;">Track Order</a></li>
          <li><a href="account.html" style="color:rgba(255,255,255,0.65);text-decoration:none;font-size:14px;">My Account</a></li>
        </ul>
      </div>
      <div>
        <h4 style="font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#EDEAE3;margin-bottom:20px;">Help</h4>
        <ul style="list-style:none;display:flex;flex-direction:column;gap:10px;">
          <li><a href="faqs.html" style="color:rgba(255,255,255,0.65);text-decoration:none;font-size:14px;">FAQs</a></li>
          <li><a href="shipping.html" style="color:rgba(255,255,255,0.65);text-decoration:none;font-size:14px;">Shipping Policy</a></li>
          <li><a href="returns.html" style="color:rgba(255,255,255,0.65);text-decoration:none;font-size:14px;">Returns</a></li>
          <li><a href="privacy.html" style="color:rgba(255,255,255,0.65);text-decoration:none;font-size:14px;">Privacy Policy</a></li>
          <li><a href="terms.html" style="color:rgba(255,255,255,0.65);text-decoration:none;font-size:14px;">Terms & Conditions</a></li>
        </ul>
      </div>
    </div>
    <div style="border-top:1px solid rgba(255,255,255,0.08);padding:20px 0;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
      <p style="font-size:13px;color:rgba(255,255,255,0.5);">© 2025 Spec Interior. All rights reserved. Made with ❤️ in India.</p>
      <div style="display:flex;gap:8px;">
        <span style="font-size:11px;padding:4px 10px;background:rgba(255,255,255,0.08);border-radius:4px;color:rgba(255,255,255,0.5);">UPI</span>
        <span style="font-size:11px;padding:4px 10px;background:rgba(255,255,255,0.08);border-radius:4px;color:rgba(255,255,255,0.5);">Visa</span>
        <span style="font-size:11px;padding:4px 10px;background:rgba(255,255,255,0.08);border-radius:4px;color:rgba(255,255,255,0.5);">Mastercard</span>
        <span style="font-size:11px;padding:4px 10px;background:rgba(255,255,255,0.08);border-radius:4px;color:rgba(255,255,255,0.5);">COD</span>
      </div>
    </div>
  </footer>`;

  // Replace mini-footer or append footer
  const miniFooter = document.querySelector('.mini-footer');
  if (miniFooter) {
    miniFooter.outerHTML = footerHTML;
  }

  // Add responsive styles
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 860px) {
      footer > div:first-child { grid-template-columns: 1fr 1fr !important; gap: 24px !important; }
    }
    @media (max-width: 500px) {
      footer { padding: 40px 20px 0 !important; }
      footer > div:first-child { grid-template-columns: 1fr !important; }
    }
  `;
  document.head.appendChild(style);
})();
