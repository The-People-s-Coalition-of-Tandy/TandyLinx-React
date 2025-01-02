import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LinkContext } from '../../context/LinkContext';

const Profile = () => {
    const { userPages, setCurrentPageLinks, getLinksFromPage } = useContext(LinkContext);
    const navigate = useNavigate();

    const handlePageClick = async (pageURL) => {
        const links = await getLinksFromPage(pageURL);
        setCurrentPageLinks(links);
        navigate(`/${pageURL}/edit`);
    };

    return (
        <div>
            <h1>Profile</h1>
            {userPages.map(({ pageURL, pageTitle }) => (
                <div key={pageURL}>
                    <button onClick={() => handlePageClick(pageURL)}>
                        {pageTitle}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Profile;