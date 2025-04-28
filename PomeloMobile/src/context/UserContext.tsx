import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import {CreditSummary} from '../models/transactionModel';
import {ApolloError, useQuery} from '@apollo/client';
import {GET_USER_CREDIT_SUMMARY} from '../apollo/graphql';

interface User {
  id: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  creditSummary: CreditSummary | null;
  userLoading: boolean;
  userError: ApolloError | undefined;
  refetchCreditSummary: () => Promise<any>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<User | null>({id: '123'});
  const [creditSummary, setCreditSummary] = useState<CreditSummary | null>(
    null,
  );

  const {
    loading: userLoading,
    error: userError,
    data: userData,
    refetch,
  } = useQuery(GET_USER_CREDIT_SUMMARY, {
    variables: {userId: user?.id},
    skip: !user?.id,
  });

  useEffect(() => {
    if (userData) {
      setCreditSummary(userData.creditSummary);
    }
  }, [userData]);

  const refetchCreditSummary = async () => {
    if (!user?.id) return;
    const result = await refetch();
    if (result.data) {
      setCreditSummary(result.data.creditSummary);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        creditSummary,
        userLoading,
        userError,
        refetchCreditSummary,
      }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
