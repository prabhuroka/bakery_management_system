import React from 'react';
import '../styles/main.css';

const About: React.FC = () => {
  return (
    <div className="about-page">
      <h1>Our Story</h1>
      <div className="about-content">
        <section>
          <h2>Traditional Baking Since 1985</h2>
          <p>
            Sweet Delights Bakery was founded with a simple mission: to create delicious, 
            high-quality baked goods using traditional methods and the finest ingredients.
          </p>
        </section>
        
        <section>
          <h2>Our Philosophy</h2>
          <p>
            We believe in slow fermentation, hand-shaping, and baking with care. 
            Every product we make reflects our commitment to craftsmanship and quality.
          </p>
        </section>
        
        <section>
          <h2>Meet Our Team</h2>
          <p>
            Our bakers bring decades of experience and passion to every loaf, pastry, 
            and cake that comes out of our ovens.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;