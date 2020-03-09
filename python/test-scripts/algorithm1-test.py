import json
import numpy as np
import pandas as pd
from scipy import spatial
from pathlib import Path

f = open("/Users/johnnanmonzon/Documents/web-projects/codenames/python/word-embeddings/glove-embeddings.txt");

blackWeight = 2.0
redWeight = 1.0
blueWeight = 4.0
maxDistance = 0.7

embeddings = {}
for line in f:
    values = line.split()
    word = values[0]
    vectors = np.asarray(values[1:], "float32")
    embeddings[word] = vectors

def distance(word, reference):
    return spatial.distance.cosine(embeddings[word], embeddings[reference])

def goodness(word, blues, reds, blacks):
    blueDist = blueWeight * sum([distance(word, blue) for blue in blues]) / len(blues)
    redDist = redWeight * sum([distance(word, red) for red in reds]) / len(reds)
    blackDist = blackWeight * sum([distance(word, black) for black in blacks]) / len(blacks)
    return blackDist + redDist - blueDist

def candidates(blues, reds, blacks):
    best = sorted(embeddings.keys(), key=lambda w: -1 * goodness(w, blues, reds, blacks))
    return best

def isValidHint(hint, words):
    for word in words:
        if hint in word or word in hint:
            return False
    return True

blues = ['apple','computer','japan','glasses']
reds = ['breakfast','lady','silk']
blacks = ['husband']
words = blues + reds + blacks

hintFound = False
hint = ''

targetWords = []
ignoredWords = []
distances = {}

while not hintFound:

    hintFound = True

    if len(blues) == 0: print ("Hello World")

    c = candidates(blues, reds, blacks)
    #
    i = 0
    hint = c[i]
    while not isValidHint(hint, words):
        i += 1
        hint = c[i]


    targetWords = []
    ignoredWords = []
    distances = {}

    for word in blues:
        dist = distance(hint, word)
        distances[word] = dist
        if dist > maxDistance:
            ignoredWords.append(word)
            hintFound = False
            blues.remove(word)
            break;
        else:
            targetWords.append(word)

results = json.dumps({
    "hint": hint,
    "count": len(blues),
    "targetWords": blues,
    "ignoredWords": ignoredWords,
    "distances": distances,
})

print(results)
