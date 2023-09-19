import random
import json
import torch
import sys
import ast
import os
from model import NeuralNet
from Chatbot import tokenization, stemming, excludePunctuation, bag_of_words, stopWordRemoval, stemminglist

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

directory_path = os.path.dirname(__file__)
file_path = os.path.join(directory_path, 'traindataset.json')
with open(file_path, 'r') as file:
    intents = json.load(file)
    
dataPthFilePath = os.path.join(directory_path, 'data.pth')
data = torch.load(dataPthFilePath)

input_size = data["input_size"]
hidden_size = data["hidden_size"]
output_size = data["output_size"]
all_words = data['all_words']
tags = data['tags']
model_state = data["model_state"]

model = NeuralNet(input_size, hidden_size, output_size).to(device)
model.load_state_dict(model_state)
model.eval()

def get_response(msg):
    sentence = tokenization(msg)
    sentence = excludePunctuation(sentence)
    sentence = stopWordRemoval(sentence)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)
    
    output = model(X)
    _, predicted = torch.max(output, dim=1) #dim=1 means that we are looking for the max value in each row
    tag = tags[predicted.item()]
    
    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]
    
    if prob.item() > 0.75:
        for intent in intents['intents']:
            if tag == intent["tag"]:
                return random.choice(intent['responses'])
    else: 
        return  " Try Something New!"
    
msg = str(sys.argv[1]) 
output = get_response(msg)
# sys.stdout.write(output)
print(output)
    
    
    


    