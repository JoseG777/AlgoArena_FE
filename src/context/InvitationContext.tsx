import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { socket } from "../lib/socket";

type InviteNotification = {
  roomCode: string;
  inviterUsername: string;
};

type InvitationContextType = {
  invitations: InviteNotification[];
  triviaInvites: InviteNotification[];
  removeInvitation: (roomCode: string) => void;
  removeTriviaInvitation: (roomCode: string) => void;
};

const InvitationContext = createContext<InvitationContextType | undefined>(undefined);

export const useInvitations = () => {
  const context = useContext(InvitationContext);
  if (context === undefined) {
    throw new Error("useInvitations must be used within an InvitationProvider");
  }
  return context;
};

type InvitationProviderProps = {
  children: ReactNode;
};

export const InvitationProvider: React.FC<InvitationProviderProps> = ({ children }) => {
  const [invitations, setInvitations] = useState<InviteNotification[]>([]);
  const [triviaInvites, setTriviaInvites] = useState<InviteNotification[]>([]);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const onFriendInvited = (data: InviteNotification) => {
      console.log("Received Invitation!", data);
      setInvitations((prev) =>
        prev.find((i) => i.roomCode === data.roomCode) ? prev : [...prev, data]
      );
    };

    const onFriendInvitedTrivia = (data: InviteNotification) => {
      console.log("Received Trivia Invitation!", data);
      setTriviaInvites((prev) =>
        prev.find((i) => i.roomCode === data.roomCode) ? prev : [...prev, data]
      );
    };

    socket.on("friendInvited", onFriendInvited);
    socket.on("friendInvitedTrivia", onFriendInvitedTrivia);

    return () => {
      socket.off("friendInvited", onFriendInvited);
      socket.off("friendInvitedTrivia", onFriendInvitedTrivia);
    };
  }, []);

  const removeInvitation = (roomCode: string) => {
    setInvitations((prev) => prev.filter((invite) => invite.roomCode !== roomCode));
  };

  const removeTriviaInvitation = (roomCode: string) => {
    setTriviaInvites((prev) => prev.filter((invite) => invite.roomCode !== roomCode));
  };

  return (
    <InvitationContext.Provider
      value={{ invitations, triviaInvites, removeInvitation, removeTriviaInvitation }}
    >
      {children}
    </InvitationContext.Provider>
  );
};
