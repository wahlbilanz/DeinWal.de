#!/usr/bin/env python
# encoding=utf8  
import csv
import os
from os import listdir
from os.path import isfile, join
import json

abst_dict = {}

res_path = os.path.dirname(os.path.realpath(__file__))



def get_row_ids (header):
	
	rowids = {
		"periode": 0,
		"siztung": 1,
		"abstimmung": 2,
		"fraktion": 3,
		"ja": 7,
		"nein": 8,
		"enthaltung": 9,
		"ungueltig": 10,
		"nichtabgegeben": 11
		}
	
	for i in range (len (header)):
		columnname = header[i].lower ()
		#print (str (i) + " -> " + columnname)
		if any (option in columnname for option in ["wahlperiode", "periode"]):
			rowids["periode"] = i
			continue
		if any (option in columnname for option in ["sitzungnr", "sitzungnummer", "sitzung"]):
			rowids["siztung"] = i
			continue
		if any (option in columnname for option in ["abstimmnr", "abstimmnummer", "abstimmung"]):
			rowids["abstimmung"] = i
			continue
		if any (option in columnname for option in ["fraktion", "gruppe"]):
			rowids["fraktion"] = i
			continue
		if any (option in columnname for option in ["ja"]):
			rowids["ja"] = i
			continue
		if any (option in columnname for option in ["nein"]):
			rowids["nein"] = i
			continue
		if any (option in columnname for option in ["enthaltung", "enthalten", "enthiel"]):
			rowids["enthaltung"] = i
			continue
		if any (option in columnname for option in ["ungueltig", "ungültig"]):
			rowids["ungueltig"] = i
			continue
		if any (option in columnname for option in ["nichtabgegeben", "nichtabgg"]):
			rowids["nichtabgegeben"] = i
			continue
		
	#print (rowids)
	return rowids

rowids = {}
fraktionen = []

for f in listdir (res_path):
	path = join (res_path, f)
	if isfile (path) and "201" in f:
		print ("processing " + f)
		
		with open(f, 'rb') as csvfile:
			dialect = csv.Sniffer().sniff(csvfile.read(1024), delimiters=";,")
			csvfile.seek(0)
			table = csv.reader(csvfile, dialect)
			for row in table:
				
				if "Wahlperiode" in row:
					rowids = get_row_ids (row)
					continue
				
				#print (row)
				
				abst_key = "%03d-%03d-%02d" % (int (row[rowids["periode"]]), int (row[rowids["siztung"]]), int (row[rowids["abstimmung"]]))
				fraktion = row[rowids["fraktion"]]
				
				if 'B' in fraktion and 'gr' in fraktion.lower ():
					fraktion = 'Gruenen'
				
				if 'linke' in fraktion.lower ():
					fraktion = 'die.linke'
					
					
					
				fraktion = fraktion.lower ()
				
				if fraktion not in fraktionen:
					fraktionen.append (fraktion)
				
				if abst_key not in abst_dict:
					abst_dict[abst_key] = {}
				abst_dict[abst_key]["file"] = f
				
				if fraktion not in abst_dict[abst_key]:
					abst_dict[abst_key][fraktion] = { "ja": 0, "nein": 0, "enthaltung": 0, "ungueltig": 0, "nichtabgegeben": 0, "gesamt": 0 }
				
				abst_dict[abst_key][fraktion]["ja"] += int (row[rowids["ja"]])
				abst_dict[abst_key][fraktion]["nein"] += int (row[rowids["nein"]])
				abst_dict[abst_key][fraktion]["enthaltung"] += int (row[rowids["enthaltung"]])
				abst_dict[abst_key][fraktion]["ungueltig"] += int (row[rowids["ungueltig"]])
				abst_dict[abst_key][fraktion]["nichtabgegeben"] += int (row[rowids["nichtabgegeben"]])
				abst_dict[abst_key][fraktion]["gesamt"] += 1
	#break

with open('results.json', 'w') as f:
	f.write (str (abst_dict))
	
with open('results.table', 'w') as f:
	f.write ("ABSTIMMUNG\t")
	for fraktion in fraktionen:
		f.write (fraktion + "\t")
	f.write ("file")
	f.write ("\n")
	
	for abstid in sorted (abst_dict):
		f.write (abstid + "\t")
		for fraktion in fraktionen:
			if fraktion in abst_dict[abstid] and abst_dict[abstid][fraktion]["ja"] + abst_dict[abstid][fraktion]["nein"] > 0:
				f.write (str (float (abst_dict[abstid][fraktion]["ja"]) / (abst_dict[abstid][fraktion]["ja"] + abst_dict[abstid][fraktion]["nein"])) + "\t")
			else:
				f.write ("0\t")
		f.write (abst_dict[abstid]["file"])
		f.write ("\n")
	
#print (abst_dict)
