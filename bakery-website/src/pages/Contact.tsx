import React from 'react';
import '../styles/main.css';

const Contact: React.FC = () => {
  return (
    <div className="contact-page">
      <h1>Contact Us</h1>
      <div className="contact-container">
        <div className="contact-info">
          <h2>Visit Our Bakery</h2>
          <p>123 Baker Street</p>
          <p>Boston, MA 02108</p>
          
          <h2>Hours</h2>
          <p>Monday - Friday: 7am - 6pm</p>
          <p>Saturday: 8am - 5pm</p>
          <p>Sunday: 8am - 3pm</p>
          
          <h2>Get in Touch</h2>
          <p>Phone: (617) 555-0123</p>
          <p>Email: info@sweetdelights.com</p>
        </div>
        
        <div className="contact-form">
          <h2>Send Us a Message</h2>
          <form>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={5} required></textarea>
            </div>
            <button type="submit" className="submit-button">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;