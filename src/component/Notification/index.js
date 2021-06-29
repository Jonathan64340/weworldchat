import React from 'react';
import { notification, Button } from 'antd';
import { WechatOutlined } from '@ant-design/icons';
let src = `${process.env.PUBLIC_URL}/sound/notif3.mp3`;
const audio = new Audio(src);

const Notification = (data, callback, user, type, ...props) => {
    const key = `open${Date.now()}`;
    let btn;
    if(type === 'group') {
        document.title = `Nouveau message du groupe ${data?.title}`
        notification.open({
            message: `Nouveau message du groupe ${data?.title}`,
            description:
            data?.type === 'string' ? (data.message.length > 30) ? `${data.message.substring(0, 30)}...` : data.message : 'A partagé un fichier',
            key,
            className: "notification-handle-receive"
        });
    } else {
        btn = (
            <Button size="middle" onClick={() => { notification.close(key); callback(data.socketIdDestination || data?.socketId, { data: { id: data?.sender, socketId: data?.socketIdDestination || data?.socketId }, id: data.sender }); document.title = `tchatez - ${user.data?.name}` }} icon={<WechatOutlined />}>
                Ouvrir la conversation
            </Button>
        );
        document.title = `Nouveau message - ${data.pseudo}`
        notification.open({
            message: `Nouveau message de ${data.pseudo}`,
            description:
            data?.type === 'string' ? (data.message.length > 30) ? `${data.message.substring(0, 30)}...` : data.message : 'Vous a envoyé un fichier',
            btn,
            key,
            className: "notification-handle-receive"
        });
    }
    audio.play();
}

export { Notification };