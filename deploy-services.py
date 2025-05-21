#!/usr/bin/env python3

import argparse
import sys

import logging
from python_on_whales import DockerClient
from python_on_whales.components.compose.cli_wrapper import ComposeCLI

files = [
    "./sensor-registry/compose.yaml",
    "./authentication-service/compose.yaml",
    "./notification-service/compose.yaml",
    "./api-gateway/compose.yaml",
    "./detection-service/compose.yaml",
]

logger = logging.getLogger("deploy-services")
logging.basicConfig(level=logging.INFO)

def build_compose(file_path: str) -> ComposeCLI:
    return DockerClient(compose_files=[file_path]).compose


def handle_compose(action: str):
    if action == "up":
        for i, compose in enumerate(map(lambda x: build_compose(x), files)):
            compose.up(detach=True, wait=True, quiet=False)
            logger.info(f"Service {files[i]} is now up and running!")
        logger.info("All images are set up and running!")

    elif action == "down":
        for i, compose in enumerate(map(lambda x: build_compose(x), files)):
            compose.down(remove_orphans=True)
            logger.info(f"Service {files[i]} has been deleted")
        logger.info("All containers are now deleted!")
    elif action == "downrmi":
        for i, compose in enumerate(map(lambda x: build_compose(x), files)):
            compose.down(remove_orphans=True, remove_images="all")
            logger.info(f"Service {files[i]} has been deleted")
        logger.info("All containers, iamges and shared network are now deleted.")
    else:
        logger.error("No command was found for: " + action)
        sys.exit(1)


if __name__ == "__main__":

    parser = argparse.ArgumentParser(
        description="Deploy all services for ER-Climate-Monitor app"
    )

    parser.add_argument(
        "action",
        choices=["up", "down", "downrmi"],
        help="""
            Action to perform:
            - 'up' to start all services
            - 'down' to stop all services
            - 'downrmi' to stop all services and to remove images and volumes """,
    )

    args = parser.parse_args()

    if args.action in ["up", "down", "downrmi"]:
        handle_compose(args.action)
        sys.exit(0)
    else:
        parser.print_help()
        sys.exit(1)
