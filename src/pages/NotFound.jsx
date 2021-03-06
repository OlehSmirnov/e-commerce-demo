import React, {useEffect} from "react"
import {Card} from "react-bootstrap"
import {Link, useNavigate} from "react-router-dom"

import styles from "../styles/pages/pages.module.css"

const NotFound = () => {

  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => navigate("/"), 5000)
  }, [])

  return (
    <Card className="w-75 m-auto">
      <div className={styles.main}>
        <Card.Header className={styles.header}>
          <div className={styles.top_content}><i className="fa-solid fa-circle-exclamation"/></div>
        </Card.Header>
        <Card.Title className={styles.content}>
          <h1>Oops, looks like the page is not here!</h1>
          <p>You will be redirected to Home page soon</p>
          <Link to="/">Go to Home</Link>
        </Card.Title>
      </div>
    </Card>
  )
}

export default NotFound