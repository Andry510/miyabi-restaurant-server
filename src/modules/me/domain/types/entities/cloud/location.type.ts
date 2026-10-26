export type TLocationOutput = {
  location: {
    id: string;
    name: string;
    address: string;
    phone_number: string;
    picture: string;
    status: boolean;
    type: string;
    created_at: string;
    updated_at: string;
  };
  server: {
    id: string;
    name: string;
    version: string;
    instance_id: string;
    status: boolean;
    last_seen: string;
    last_sync: string;
    created_at: string;
    updated_at: string;
    online: boolean;
  };
};
