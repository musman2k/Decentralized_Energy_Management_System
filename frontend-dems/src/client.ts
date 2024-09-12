import { createThirdwebClient } from 'thirdweb';

const CLIENT_ID = import.meta.env.VITE_TEMPLATE_CLIENT_ID;

export const client = createThirdwebClient({
    clientId: CLIENT_ID,
});