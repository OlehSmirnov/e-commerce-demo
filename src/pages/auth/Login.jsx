import React, {useState} from "react"
import {Button, Card, Form, FormControl, FormGroup, FormLabel} from "react-bootstrap"
import {Link, useNavigate} from "react-router-dom"
import auth, {loginUser} from "../../firebase/firebase"

const Login = () => {

  const navigate = useNavigate()
  const [userData, setUserData] = useState({email: "", password: ""})
  const [textInfo, setTextInfo] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await loginUser(userData)
    setTextInfo(res.toString())
    if (!res.toString().includes("Error"))
      navigate("/")
  }

  const handleChange = (e) => {

    setUserData(prevState => ({
      ...prevState,
      [e.target.type]: e.target.value
    }))
  }

  return (
    <Card className="w-50 m-auto p-3">
      <Card.Title>
        <h2>Login</h2>
      </Card.Title>
      <Form onSubmit={handleSubmit} onChange={handleChange}>
        <FormGroup>
          <FormLabel htmlFor="email">Email:</FormLabel>
          <FormControl type="email" className="text-start ms-0"></FormControl>
        </FormGroup>
        <FormGroup>
          <FormLabel htmlFor="password">Password:</FormLabel>
          <FormControl type="password" className="text-start ms-0"></FormControl>
        </FormGroup>
        <Button type="submit" className="w-100 mt-3">Login</Button>
        <p className="mt-3 text-center">
          Not have an account? <Link to="/signup" className="text-primary">Sign Up</Link>
        </p>
      </Form>
      <h4 className="text-danger text-center">{textInfo}</h4>
    </Card>
  )
}

export default Login