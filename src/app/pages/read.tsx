import { useEffect, useState } from "react";

export const ReadMode: React.FC = () => {
    const [link, setLink] = useState<string>('');

    useEffect(() => {
        // Get the 'link' from localStorage
        const currentLink = localStorage.getItem('link');
        if (currentLink) {
            setLink(currentLink); // Set the link if it's found
        }
    }, []); // Only run once when component mounts

    // Function to ensure the URL has a valid protocol
    const formatLink = (url: string) => {
        // Check if the link starts with 'http' or 'https'
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        // If the link starts with 'www', prepend 'https://'
        if (url.startsWith('www')) {
            return `https://${url}`;
        }
        // Otherwise, return the URL as is (fallback)
        return url;
    };

    // Use the formatted link for the iframe src
    const iframeSrc = link ? formatLink(link) : 'https://www.404.com';

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <iframe
                height="100%"
                width="100%"
                src={iframeSrc}
                title="Embedded Content"
                allow="autoplay"
            ></iframe>
        </div>
    );
};

export default ReadMode;
