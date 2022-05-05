import React from "react"
import {Link, useNavigate} from "react-router-dom"
import {Card} from "react-bootstrap"

import styles from "../../styles/pages/pages.module.css"

const StripeCancel = () => {

  const navigate = useNavigate()

  setTimeout(() => navigate("/"), 3000)

  return (
    <Card className="w-75 m-auto" >
        <div className={styles.main}>
          <Card.Header className={`${styles.header} bg-danger`}>
            <div className={styles.top_content}><i className="fa-solid fa-xmark"/></div>
          </Card.Header>
          <Card.Title className={styles.content}>
            <h1>Payment Cancelled !</h1>
            <p>You will be redirected to Home page soon</p>
            <Link to="/">Go to Home</Link>
          </Card.Title>
        </div>
    </Card>
  )
}

export default StripeCancel