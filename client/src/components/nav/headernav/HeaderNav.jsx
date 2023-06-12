import React from "react";
import "../Nav.css";
import { useQuery } from '@apollo/client';
import { GET_ME } from '../../../utils/queries';

function HeaderNav() {
    const { loading, data } = useQuery(GET_ME);
    const userData = data?.me || {};

    return (
        <>
            <a className="desktop-nav-btns" href="">Social</a>
            <a className="desktop-nav-btns" href={`/profile/${userData.username}`}>Profile</a>
            <a className="desktop-nav-btns" href="/browse">Browse</a>
        </>
    );
};

export default HeaderNav;