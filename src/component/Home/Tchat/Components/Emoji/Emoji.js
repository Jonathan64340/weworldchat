import React, { useState } from 'react';
import { Button } from 'antd';
import Picker, { SKIN_TONE_LIGHT } from 'emoji-picker-react';
import { SmileOutlined } from '@ant-design/icons';
import './emoji.css';

const Emoji = ({ onEmojiChoose }) => {
    const [open, setOpen] = useState(false);

    const chooseEmoji = (event, emoji) => {
        onEmojiChoose(emoji)
    }

    const emojiMenu = () => {
        return <>
            {open && <Picker onEmojiClick={chooseEmoji} groupNames={{
                smileys_people: 'yellow faces'
            }} disableSearchBar className="emoji-select" skinTone={SKIN_TONE_LIGHT} />}
        </>
    }

    return (<>
        <Button size="large" type="text" onClick={() => setOpen(!open)} icon={<SmileOutlined />} />
        {emojiMenu()}
    </>)
};

export default Emoji;