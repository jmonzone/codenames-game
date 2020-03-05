
import gensim

model = gensim.models.KeyedVectors.load_word2vec_format('/Users/anthonyastarita/ml/thesis/GoogleNews-vectors-negative300.bin', binary=True, limit=500000)


answers = ["church", "cat", "help"]
bad = ["fair", "eye", "dog", "buck", "pin", "hospital"]


import csv
import unicodedata

with open('top5000.csv', newline='') as f:
    reader = csv.reader(f)
    data = list(reader)

# print(data[0])

import csv
import unicodedata

with open('top5000.csv', newline='') as f:
    reader = csv.reader(f)
    data = list(reader)

data = [str(w).replace('\\xa0', '') for w in data]
data = [str(w).replace("['", '') for w in data]
data = [str(w).replace("']", '') for w in data]



import numpy as np

embeddings = {}
for word in data:
    if word in model.vocab:
        vector = np.asarray(model.get_vector(word), "float32")
        embeddings[word] = vector


from scipy import spatial
def distance(word, reference):
    return spatial.distance.cosine(embeddings[word], embeddings[reference])

def closest_words(reference):
    return sorted(embeddings.keys(), key=lambda w: distance(w, reference))

#[(w, ", ".join(closest_words(w)[1:10]) + "...") for w in ["star", "board", "cream", "chair", "mask"]]


def goodness(word, answers, bad):
    return sum([distance(word, b) for b in bad]) - 4.0 * sum([distance(word, a) for a in answers])

def minimax(word, answers, bad):
    return min([distance(word, b) for b in bad]) - max([distance(word, a) for a in answers])

def candidates(answers, bad, size=100):
    best = sorted(embeddings.keys(), key=lambda w: -1 * goodness(w, answers, bad))
    res = [(str(i + 1), "{0:.2f}".format(minimax(w, answers, bad)), w) for i, w in enumerate(sorted(best[:250], key=lambda w: -1 * minimax(w, answers, bad))[:size])]
    return [(". ".join([c[0], c[2]]) + " (" + c[1] + ")") for c in res]

import pandas as pd
from itertools import zip_longest

def grouper(n, iterable, fillvalue=None):
    args = [iter(iterable)] * n
    return zip_longest(fillvalue=fillvalue, *args)

from IPython.display import HTML

# def tabulate(data):
#     data = list(grouper(10, data))
#     return HTML(pd.DataFrame(data).to_html(index=False, header=False))

# tabulate(candidates(answers, bad))

print(candidates(answers,bad)[0])
