import React from "react"
import Card from "react-bootstrap/Card"
import Col from "react-bootstrap/Col"
import classes from "./ProductCard.module.css"

const ProductCard = ({image, title, price}) => {
  const titleStr = title.substring(0, 30)
  return (
    <Col>
      <Card className={classes.card}>
        <div className={classes.image_container}>
          <Card.Img className={classes.image} variant="top" src={image}/>
        </div>
        <Card.Body>
          <Card.Title className={classes.title}>{titleStr}</Card.Title>
          <Card.Subtitle>${price}</Card.Subtitle>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default ProductCard;