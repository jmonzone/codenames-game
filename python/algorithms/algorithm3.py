import sys
import json
import numpy as np
import pandas as pd
from scipy import spatial
from pathlib import Path
from itertools import combinations

input = json.loads(sys.argv[1])
blues = input['blues']
reds = input['reds']
blacks = input['blacks']
words = blues + reds + blacks
blueWeight = input['blueWeight']
redWeight = input['redWeight']
blackWeight = input['blackWeight']
maxCosDistance = input['maxCosDistance']
minTargetWords = input['minTargetWords']
vectorPath = "word-embeddings/" + input['vectorPath']

f = open(Path(__file__).parent.parent / vectorPath);

embeddings = {}
for line in f:
    values = line.split()
    word = values[0]
    vectors = np.asarray(values[1:], "float32")
    embeddings[word] = vectors

def distance(word, reference):
    return spatial.distance.cosine(embeddings[word], embeddings[reference])

def goodness(word, blues, reds, blacks):
    blueDist = blueWeight * sum([distance(word, blue) for blue in blues])
    redDist = redWeight * sum([distance(word, red) for red in reds])
    blackDist = blackWeight * sum([distance(word, black) for black in blacks])
    return blackDist + redDist - blueDist

def candidates(blues, reds, blacks):
    best = sorted(embeddings.keys(), key=lambda w: -1 * goodness(w, blues, reds, blacks))
    return best

def isValidHint(hint, words):
    for word in words:
        if hint in word or word in hint:
            return False
    return True

combs = []
averages = {}

for i in range(minTargetWords, 5):
    combs += list(combinations(blues, i));

for comb in combs:
    distances = [sum([distance(word, b) for b in comb]) / (len(comb) - 1) for word in comb] if len(comb) > 1 else [0];
    averages[comb] = sum(distances) / len(distances)

averages = sorted(averages.items(), key=lambda x: (len(x[0]) if x[1] < maxCosDistance else 0, -x[1]), reverse=True)
targetWordCombs = {}
for average in averages:
    targetWordCombs[str(average[0])] = average[1]
    if len(targetWordCombs) > 10:
        break

targetWords = averages[0][0]

candidates = candidates(targetWords, reds, blacks)
hints = {}
for candidate in candidates:
    if isValidHint(candidate, words):
        hints[candidate] = sum([distance(word, candidate) for word in targetWords]) / len(targetWords)
    if len(hints) > 10:
        break

hint = list(hints.keys())[0]

results = json.dumps({
    "hint": hint,
    "count": len(targetWords),
    "targetWords": str(targetWords),
    "top10Hints": hints,
    "otherTargetWordCombos": targetWordCombs,
})

print(results)

sys.stdout.flush()
