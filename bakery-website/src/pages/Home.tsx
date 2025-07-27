import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Carousel, Row, Col, Card } from 'react-bootstrap';
import '../styles/main.css';

const Home: React.FC = () => {
  return (
    <div className="home-page">
      {/* Hero Section with Carousel */}
      <Carousel fade controls={false} indicators={false}>
        <Carousel.Item className="hero-slide">
          <div className="hero-content text-center text-white">
            <h1 className="display-4 fw-bold mb-4">Fresh Baked Goods Made With Love</h1>
            <p className="lead mb-5">Discover our delicious selection of artisanal breads, pastries, and cakes</p>
            <Link to="/menu" className="btn btn-primary btn-lg px-4 py-2">
              View Our Menu
            </Link>
          </div>
        </Carousel.Item>
      </Carousel>
      
      {/* Featured Section */}
      <section className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5">Our Specialties</h2>
          <Row>
            <Col md={4} className="mb-4 mb-md-0">
              <Card className="h-100 border-0 shadow-sm hover-lift">
                <Card.Body className="text-center p-4">
                  <div className="bread-img icon-xl bg-primary-light text-primary rounded-circle mb-4">
                    <i className="bi bi-bread"></i>
                  </div>
                  <h3>Artisan Breads</h3>
                  <p className="text-muted">Handcrafted using traditional methods</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4 mb-md-0">
              <Card className="h-100 border-0 shadow-sm hover-lift">
                <Card.Body className="text-center p-4">
                  <div className="pastry-img icon-xl bg-primary-light text-primary rounded-circle mb-4">
                    <i className="bi bi-cupcake"></i>
                  </div>
                  <h3>Decadent Pastries</h3>
                  <p className="text-muted">Flaky, buttery perfection</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm hover-lift">
                <Card.Body className="text-center p-4">
                  <div className="cake-img icon-xl bg-primary-light text-primary rounded-circle mb-4">
                    <i className="bi bi-cake"></i>
                  </div>
                  <h3>Custom Cakes</h3>
                  <p className="text-muted">Celebrate with our signature creations</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;