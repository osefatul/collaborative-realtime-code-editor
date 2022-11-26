import React from 'react';
import Avatar from 'react-avatar';

const Client = ({ username }) => {
    return (
        <div className="client">
            <div className='onlinePoint' />
            <Avatar name={username} size={30} round="50%" />
            <span className="userName">{username}</span>
        </div>
    );
};

export default Client;