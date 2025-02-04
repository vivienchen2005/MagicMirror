import { Alert } from 'react-native';

const API_URL = 'https://bounty.couriersix.xyz';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  json?: any;
  formData?: FormData;
}

export class Api {
  private token: string | null = null;

  async authenticate(token?: string) {
    this.token = token ?? null;
  }

  async deauthenticate() {
    this.token = null;
  }

  async version() {
    return this.fetch<MessageDto>('/version', {
      method: 'GET',
    });
  }

  async refreshToken() {
    return this.fetch<TokenDto>('/refresh_token', {
      method: 'POST',
    });
  }

  async register(name: string, email: string, password: string) {
    return this.fetch<MessageDto>('/register', {
      method: 'POST',
      json: { name, email, password },
    });
  }

  async login(email: string, password: string) {
    return this.fetch<UserResponseDto>('/login', {
      method: 'POST',
      json: { email, password },
    });
  }

  async removeUser() {
    return this.fetch<MessageDto>('/remove_user', {
      method: 'DELETE',
    });
  }

  async changeUsername(name: string) {
    return this.fetch<MessageDto>('/change_username', {
      method: 'POST',
      json: { name } as ChangeUsernameDto,
    });
  }

  async changePassword(previous_password: string, new_password: string) {
    return this.fetch<MessageDto>('/change_password', {
      method: 'POST',
      json: { previous_password, new_password } as ChangePasswordDto,
    });
  }

  async requestChangeEmail(email: string, password: string) {
    return this.fetch<MessageDto>('/change_email', {
      method: 'POST',
      json: { email, password } as LoginUserDto,
    });
  }

  async requestResetPassword(email: string) {
    return this.fetch<MessageDto>('/reset_password', {
      method: 'POST',
      json: { email } as RequestResetPasswordDto,
    });
  }

  async getCurrentBounty() {
    return this.fetch<CurrentBountyDto>('/bounty', {
      method: 'GET',
    });
  }

  async completeBounty(target_ble_id: string) {
    return this.fetch<MessageDto>('/bounty', {
      method: 'POST',
      json: { target_ble_id } as PostBountyDto,
    });
  }

  async getFriendshipToken() {
    return this.fetch<TokenDto>('/friendship_token', {
      method: 'GET',
    });
  }

  async addFriend(dto: PostNewFriendDto) {
    return this.fetch<FriendDto>('/friends', {
      method: 'POST',
      json: dto,
    });
  }

  async removeFriend(friend_id: string) {
    return this.fetch<MessageDto>('/friends', {
      method: 'DELETE',
      json: { id: friend_id } as UuidDto,
    });
  }

  async setActiveFriend(friend_id: string, active: boolean) {
    return this.fetch<MessageDto>('/friends/active', {
      method: 'POST',
      json: { id: friend_id, active } as ActiveFriendDto,
    });
  }

  async getFriends(device_uuid: string) {
    return this.fetch<FriendDto[]>('/friends', {
      method: 'GET',
      json: { id: device_uuid } as UuidDto,
    });
  }

  async getFriendsBounties(device_uuid: string) {
    return this.fetch<BountyDto[]>('/friends/bounties', {
      method: 'GET',
      json: { id: device_uuid } as UuidDto,
    });
  }

  async getBountyHistory() {
    return this.fetch<BountyHistoryDto[]>('/bounty_history', {
      method: 'GET',
    });
  }

  async setPfp(image: Blob) {
    const formData = new FormData();
    formData.append('file', image);

    return this.fetch<MessageDto>('/pfps', {
      method: 'POST',
      formData,
    });
  }

  async getPfpPresigned(user_ids: string[]) {
    return this.fetch<PfpsDto>('/pfps', {
      method: 'POST',
      json: { user_ids } as PfpRequestDto,
    });
  }

  async removePfp() {
    return this.fetch<MessageDto>('/pfps', {
      method: 'DELETE',
    });
  }

  async getShopSkins() {
    return this.fetch<SkinDto[]>('/skins/shop', {
      method: 'GET',
    });
  }

  async getOwnedSkins() {
    return this.fetch<SkinDto[]>('/skins/owned', {
      method: 'GET',
    });
  }

  async getSkin(skin_id: string) {
    return this.fetch<SkinDto>('/skins', {
      method: 'GET',
      json: { id: skin_id } as UuidDto,
    });
  }

  async validatePurshaseIos(receipt: string) {
    return this.fetch<MessageDto>('/skins/purchase_ios', {
      method: 'POST',
      json: { jws_representation: receipt } as IOSPaymentValidationDto,
    });
  }

  async fetch<T>(route: string, options: FetchOptions = {}): Promise<T | null> {
    try {
      const { method = 'GET', headers = {}, json, formData, params } = options;

      const requestOptions: RequestInit = {
        method,
        headers: {
          ...(this.token && { Authorization: `Bearer ${this.token}` }),
          ...(json && { 'Content-Type': 'application/json' }),
          ...(formData && { 'Content-Type': 'multipart/form-data' }),
          ...headers,
        },
        ...(json && { body: JSON.stringify(json) }),
        ...(formData && { body: formData }),
      };

      const url = new URL(API_URL + route);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });
      }

      const response = await fetch(url.toString(), requestOptions);

      const data = await response.json();

      if (response.status >= 400) {
        Alert.alert('Api error', data.error, [
          { text: 'womp womp', onPress: () => {} },
        ]);

        return null;
      }

      return data as T;
    } catch (error) {
      Alert.alert('Network error', error as string, [
        { text: 'womp womp', onPress: () => {} },
      ]);

      return null;
    }
  }
}
