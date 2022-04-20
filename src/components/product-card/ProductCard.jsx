import React from "react"
import Card from "react-bootstrap/Card"
import Col from "react-bootstrap/Col"
import classes from "./ProductCard.module.css"

const ProductCard = ({image, title, price}) => {
  return (
    <Col>
      <Card className={classes.card}>
        <Card.Img className={classes.image} variant="top" src={image}/>
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          <Card.Subtitle>${price}</Card.Subtitle>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default ProductCard;