import React, { useContext } from 'react';
import { LinkContext } from './context/LinkContext';
import { useNavigate } from 'react-router-dom';
const Profile = () => {
    const { userPages, setCurrentPageLinks, getLinksFromPage } = useContext(LinkContext);
    const navigate = useNavigate();
    console.log(userPages);
    return (
        <div>
            <h1>Profile</h1>
            {userPages.map((page, index) => (
                <div key={index}>
                    <button onClick={async () => {
                        // get links from page
                        const links = await getLinksFromPage(page.pageURL);
                        setCurrentPageLinks(links);
                        // go to editor
                        navigate(`/${page.pageURL}/edit`);
                    }}>
                        {page.pageTitle}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Profile;