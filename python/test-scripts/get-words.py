import json
import numpy as np
import pandas as pd
from scipy import spatial
from pathlib import Path
import random

f = open("/Users/johnnanmonzon/Documents/web-projects/codenames/python/word-embeddings/glove-embeddings.txt");

# def isValidWord(word):
#     if word.isalpha():
#         return True
#     return False
#
# numWords = 8
#
# words = []
# for line in f:
#     values = line.split()
#     word = values[0]
#     if isValidWord(word):
#         words.append(values[0])
#
#
# words = random.choices(words, k=numWords)
# print(words)
