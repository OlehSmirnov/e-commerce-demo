import React, {useState} from "react"
import {Card, Button, Spinner} from "react-bootstrap"
import auth, {database, setUserFavorites} from "../firebase/firebase"
import {signOutUser} from "../firebase/firebase"
import {onAuthStateChanged} from "firebase/auth"
import {useNavigate} from "react-router-dom"

import Favorites from "../components/favorites/Favorites"
import {onValue, ref} from "firebase/database";

const UserCabinet = () => {

  const navigate = useNavigate()

  const [isAuthenticated, setIsAuthenticated] = useState(null)

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setIsAuthenticated(true)
    }
    else
      setIsAuthenticated(false)
  })

  const handleLogOut = () => {
    signOutUser()
    navigate("/")
  }

  if (isAuthenticated === null) return <div className="d-flex justify-content-center">
    <Spinner animation="grow"/>
  </div>

  if (!isAuthenticated) return <h2 className="text-center">You are not logged in!</h2>

  return (
    <Card>
      <Card.Body>
        <h2>Hello {auth.currentUser.email}!</h2>
        {/*<Favorites/>*/}
        <Button variant="danger" onClick={handleLogOut}>Log out</Button>
      </Card.Body>
    </Card>
  )
}

export default UserCabinet