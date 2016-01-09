#!/usr/bin/python3

import argparse
import logging
import os

import yaml
from PIL import Image

logging.basicConfig(level=logging.INFO)


class ImageConverter(object):

    KEY_DESTINATION_WIDTH = 'dest_w'

    def __init__(self, name, raw_params):
        self.name = name
        self.raw_params = raw_params

    @property
    def format(self):
        return self.raw_params.get('format', 'png')

    @property
    def source_x(self):
        return self.raw_params.get('src_x', '0%')

    @property
    def source_y(self):
        return self.raw_params.get('src_y', '0%')

    @property
    def source_width(self):
        return self.raw_params.get('src_w', '100%')

    @property
    def source_height(self):
        return self.raw_params.get('src_h', '100%')

    @property
    def resize_filter(self):
        filter_name = self.raw_params.get('resize_filter', 'ANTIALIAS')
        _filter = getattr(Image, filter_name, None)
        if _filter is None:
            raise KeyError(
                '{}: Invalid filter name {}'.format(self.name, filter_name)
            )
        return _filter

    @property
    def mode(self):
        return self.raw_params.get('mode', 'P')

    @property
    def destination_width(self):
        width = self.raw_params.get(self.KEY_DESTINATION_WIDTH, None)
        if width is None:
            raise KeyError(
                '{}: Missing required key {}'.
                format(self.name, self.KEY_DESTINATION_WIDTH)
            )
        return width

    @property
    def destination_height(self):
        return self.raw_params.get('dest_h', self.destination_width)

    def crop_coord(self, original_size, source_coord):
        if isinstance(source_coord, str) and source_coord.endswith('%'):
            source_coord = int(source_coord[:-1])
            converted_coord = int((original_size * source_coord) / 100)
        else:
            converted_coord = int(source_coord)
        return converted_coord

    def convert(self, original_image):
        original_width, original_height = original_image.size
        crop_x = self.crop_coord(original_width, self.source_x)
        crop_y = self.crop_coord(original_height, self.source_y)
        crop_coords = [
            crop_x,
            crop_y,
            crop_x+self.crop_coord(original_width, self.source_width),
            crop_y+self.crop_coord(original_height, self.source_height)
        ]
        return original_image.\
            copy().\
            crop(box=crop_coords).\
            resize([self.destination_width, self.destination_height],
                   self.resize_filter).\
            convert(self.mode)


def convert_images_with_base(destination_dir, original_image, definition):
    for key, value in definition.items():
        if ImageConverter.KEY_DESTINATION_WIDTH in value:
            converter = ImageConverter(key, value)
            new_image = converter.convert(original_image)
            image_file_path = os.path.join(
                    destination_dir,
                    '{}.{}'.format(converter.name, converter.format)
            )
            new_image.save(image_file_path)
        else:
            convert_images_with_base(os.path.join(destination_dir, key),
                                     original_image,
                                     value)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
            description='Constructs all required images from a single image')
    parser.add_argument(
            'image', metavar='IMAGE',
            help='the base image for all outputted images')
    parser.add_argument(
            'definition', metavar='DEFINITION',
            help='file containing destination and format definitions for all '
                 'images')
    parser.add_argument(
            '-d', '--destination-dir',
            default=os.path.join(os.path.dirname(__file__), 'res'),
            help='directory and it\'s sub-directories where resulting images '
                 'will be outputted')

    args = parser.parse_args()

    with open(args.definition, 'rb') as handle:
        data = yaml.load(handle)

    image = Image.open(args.image)
    try:
        convert_images_with_base(args.destination_dir, image, data)
    except:
        logging.exception('Failed to convert images!')
