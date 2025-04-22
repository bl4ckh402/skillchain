
import { useEffect, useState } from 'react';

export type UseClientOptions = {

};

export const useVideoClient = ({
}: UseClientOptions) => {
  const [videoClient, setVideoClient] = useState();


  return videoClient;
};