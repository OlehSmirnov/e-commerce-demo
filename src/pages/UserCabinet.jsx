import React from "react"
import auth from "../firebase/firebase"
import {Card, Button} from "react-bootstrap"
import {signOutUser} from "../firebase/firebase"
import {useNavigate} from "react-router-dom"

const UserCabinet = () => {

  const navigate = useNavigate()

  const handleLogOut = () => {
    signOutUser()
    navigate("/")
  }
  if (!auth.currentUser) return <h2 className="text-center">You are not logged in!</h2>

  return (
    <Card>
      <Card.Body>
        <h2>Hello {auth.currentUser.email}!</h2>
        <Button variant="danger" onClick={handleLogOut}>Log out</Button>
      </Card.Body>
    </Card>
  )
}

export default UserCabinet