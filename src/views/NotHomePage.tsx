import { useAuth } from "../context/AuthContext";

const NotHomePage: React.FC = () =>
{
    const {user} = useAuth();
    return(
        <div>
            <h1> This file was created for testing purposes. </h1>
            <br/>
            <h2>{user?.sub}</h2>
            <br/>
            <h2>{user?.username}</h2>
            <br/>
            <h2>{user?.email}</h2>
        </div>
    )
}

export default NotHomePage;