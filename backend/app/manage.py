"""Local user provisioning; passwords never appear in command arguments."""
import argparse
from getpass import getpass
from argon2 import PasswordHasher
from sqlalchemy import select
from .db import SessionLocal
from .models import User

def main():
    parser=argparse.ArgumentParser(description="Provision a local AEGIS-X account")
    parser.add_argument("username")
    parser.add_argument("--role",choices=["analyst","administrator"],default="analyst")
    args=parser.parse_args()
    if not 1<=len(args.username)<=80: parser.error("Username must be 1–80 characters")
    password=getpass("Password (12+ characters): ")
    if len(password)<12 or password!=getpass("Confirm password: "): parser.error("Passwords must match and contain at least 12 characters")
    with SessionLocal() as db:
        if db.scalar(select(User).where(User.username==args.username)): parser.error("Username already exists")
        db.add(User(username=args.username,password_hash=PasswordHasher().hash(password),role=args.role));db.commit()
    print("Account created")
if __name__=="__main__": main()
