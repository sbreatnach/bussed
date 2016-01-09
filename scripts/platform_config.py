#!/usr/bin/env python
import xml.etree.ElementTree as ET
import argparse
import logging
import os

logging.basicConfig()


def merge_xml_nodes(src_node, merge_node):
    for key, value in merge_node.items():
        src_node.set(key, value)
    merge_text = merge_node.text.strip()
    if merge_text:
        src_node.text = merge_text
    for index, merge_child in enumerate(merge_node):
        src_child = src_node.find(merge_child.tag)
        if src_child is not None:
            merge_xml_nodes(src_child, merge_child)


def merge_platform_config(platform):
    platform_path = os.path.join('platforms', 'config', platform)
    config_file = 'config.xml'
    config_path = os.path.join(platform_path, config_file)
    if os.path.exists(config_path):
        # register namespaces used by the config.xml file
        ET.register_namespace('cdv', 'http://cordova.apache.org/ns/1.0')
        ET.register_namespace('vs', 'http://schemas.microsoft.com/appx/2014/htmlapps')
        ET.register_namespace('', 'http://www.w3.org/ns/widgets')

        source_tree = ET.parse('config.xml')
        source_root = source_tree.getroot()

        merge_tree = ET.parse(config_path)
        merge_root = merge_tree.getroot()

        merge_xml_nodes(source_root, merge_root)

        with open('override.' + config_file, 'wb') as handle:
            source_tree.write(handle, encoding='utf-8', xml_declaration=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
            description='Merges the platform-specific configs (if applicable) into the root config.xml')
    parser.add_argument(
            'platforms', metavar='PLATFORMS', nargs='+',
            help='list of platforms')

    cmd_args = parser.parse_args()

    for platform in cmd_args.platforms:
        merge_platform_config(platform)