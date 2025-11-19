import React, { 
    createContext, 
    useContext, 
    useState, 
    useEffect, 
    type ReactNode
} from "react";
import { socket } from "../lib/socket"; 

type InviteNotification = {
  roomCode: string;
  inviterUsername: string;
};

type InvitationContextType = {
  invitations: InviteNotification[];
  removeInvitation: (roomCode: string) => void;
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

  // Listen for friend invitations via socket
  useEffect(() => {
    if (!socket.connected) socket.connect(); 

    const onFriendInvited = (data: InviteNotification) => {
      console.log("Received Invitation!", data);
      setInvitations((prev) => 
        prev.find(i => i.roomCode === data.roomCode) ? prev : [...prev, data]
      );
    };
    socket.on("friendInvited", onFriendInvited);
    return () => {
      socket.off("friendInvited", onFriendInvited);
    };
  }, []);

  const removeInvitation = (roomCode: string) => {
    setInvitations((prev) => prev.filter((invite) => invite.roomCode !== roomCode));
  };

  return (
    <InvitationContext.Provider value={{ invitations, removeInvitation }}>
      {children}
    </InvitationContext.Provider>
  );
};