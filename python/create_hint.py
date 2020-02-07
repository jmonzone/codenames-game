import sys
# import json
#
# import numpy as np
# import pandas as pd
# from scipy import spatial
#
# embeddings = {}
# with open("/Users/johnnanmonzon/Documents/web-projects/codenames/python/top_5000.txt", 'r') as f:
#     for line in f:
#         values = line.split()
#         word = values[0]
#         vector = np.asarray(values[1:], "float32")
#         embeddings[word] = vector
#
#
# def distance(word, reference):
#     return spatial.distance.cosine(embeddings[word], embeddings[reference])
#
# def closest_words(reference):
#     return sorted(embeddings.keys(), key=lambda w: distance(w, reference))
#
# def goodness(word, answers, bad):
#     return sum([distance(word, b) for b in bad]) - 4.0 * sum([distance(word, a) for a in answers])
#
# def minimax(word, answers, bad):
#     return min([distance(word, b) for b in bad]) - max([distance(word, a) for a in answers])
#
# def candidates(answers, bad, size=100):
#     best = sorted(embeddings.keys(), key=lambda w: -1 * goodness(w, answers, bad))
#     res = [(str(i + 1), "{0:.2f}".format(minimax(w, answers, bad)), w) for i, w in enumerate(sorted(best[:250], key=lambda w: -1 * minimax(w, answers, bad))[:size])]
#     return [(c[2]) for c in res]
#
# # words = json.loads(sys.argv[1])
# #
# # answers = []
# # bad = []
# #
# # for word in words:
# #     if word['color'] == 'blue':
# #         answers.append(word['string']);
# #     elif word['color'] == 'red':
# #         bad.append(word['string']);
# #     elif word['color'] == 'black':
# #         bad.append(word['string']);
#
# answers = ['apple','japan','bag','fish']
# bad = ['computer','italy','glasses','dictionary']
#
# print(candidates(answers,bad)[0])

print("helloworld")


sys.stdout.flush()
