import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FloatingChatButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/ai/chat');
  };

  return (
    <Button
      onClick={handleClick}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 bg-blue-500 hover:bg-blue-600"
    >
      <MessageSquare className="h-6 w-6" />
    </Button>
  );
};

export default FloatingChatButton;
