import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const Protected = () => {
    const token = getCookie('token')
    
    function getCookie(name) {
        const cookies = document.cookie.split('; ');
        for (const cookie of cookies) {
            const [cookieName, cookieValue] = cookie.split('=');
            if (cookieName === name) {
                return cookieValue;
            }
        }
        return null;
    }

    return (
        token ? <Outlet /> : <Navigate to="/login" />
    )
}

export default Protected;