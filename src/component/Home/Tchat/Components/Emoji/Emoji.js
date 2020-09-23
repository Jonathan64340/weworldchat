import React, { useState } from 'react';
import { Button, Dropdown, Menu } from 'antd';
import Picker, { SKIN_TONE_LIGHT } from 'emoji-picker-react';
import { SmileOutlined } from '@ant-design/icons';

const Emoji = ({ onEmojiChoose }) => {
    const [open, setOpen] = useState(false);

    const chooseEmoji = (event, emoji) => {
        onEmojiChoose(emoji)
    }

    const emojiMenu = () => {
        return <Menu>
            <Menu.Item>
                {open && <Picker onEmojiClick={chooseEmoji} groupNames={{
                    smileys_people: 'yellow faces'
                }} disableSearchBar className="emoji-select" skinTone={SKIN_TONE_LIGHT} />}
            </Menu.Item>
        </Menu>
    }

    return (<>
        <Dropdown trigger={['click']} overlay={emojiMenu}>
            <Button size="large" type="text" onClick={() => setOpen(true)} icon={<SmileOutlined />} />
        </Dropdown>
    </>)
};

export default Emoji;