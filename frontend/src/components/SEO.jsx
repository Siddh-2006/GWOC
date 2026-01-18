import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, name, type, image, url }) => {
    const siteName = "MindSettler";
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const defaultDescription = "MindSettler - Professional Mental Health Support and Resources. Find peace and balance with our expert-led sessions.";
    const defaultUrl = "https://mindsettler.com";
    const defaultImage = "https://mindsettler.com/og-image.jpg"; // Placeholder for OG image

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{fullTitle}</title>
            <meta name='description' content={description || defaultDescription} />

            {/* Facebook tags (Open Graph) */}
            <meta property="og:type" content={type || "website"} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:url" content={url || defaultUrl} />
            <meta property="og:image" content={image || defaultImage} />

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name || siteName} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description || defaultDescription} />
            <meta name="twitter:image" content={image || defaultImage} />
        </Helmet>
    );
};

export default SEO;
