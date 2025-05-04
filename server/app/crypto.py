import hashlib
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Cipher import AES


def hash_fingerprint(data):
    return hashlib.sha256(data.encode()).hexdigest()

def derive_key(fp_hash, salt):
    return PBKDF2(fp_hash, salt, dkLen=32)

def encrypt_data(data, key):
    cipher = AES.new(key, AES.MODE_EAX)
    ciphertext, tag = cipher.encrypt_and_digest(data)
    return cipher.nonce + tag + ciphertext

def decrypt_data(encrypted, key):
    nonce = encrypted[:16]
    tag = encrypted[16:32]
    ciphertext = encrypted[32:]
    cipher = AES.new(key, AES.MODE_EAX, nonce=nonce)
    return cipher.decrypt_and_verify(ciphertext, tag)
