package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sort"
	"strconv"
	"strings"
)

type Name struct {
	Common   string `json:"common"`
	Official string `json:"official"`
}

type CurrencyDetail struct {
	Name   string `json:"name"`
	Symbol string `json:"symbol"`
}

type Flags struct {
	PNG string `json:"png"`
	SVG string `json:"svg"`
}

type Country struct {
	Name       Name                       `json:"name"`
	Capital    []string                   `json:"capital"`
	Region     string                     `json:"region"`
	Subregion  string                     `json:"subregion"`
	Population int                        `json:"population"`
	Currencies map[string]CurrencyDetail  `json:"currencies"`
	Languages  map[string]string          `json:"languages"`
	Flags      Flags                      `json:"flags"`
}

var countries []Country

func healthz(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"ok": true})
}

func getItems(w http.ResponseWriter, r *http.Request) {
	q := strings.ToLower(r.URL.Query().Get("q"))
	region := strings.ToLower(r.URL.Query().Get("type"))
	sortBy := r.URL.Query().Get("sort")
	order := r.URL.Query().Get("order")
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	limit, _ := strconv.Atoi(limitStr)
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	offset, _ := strconv.Atoi(offsetStr)
	if offset < 0 {
		offset = 0
	}

	filtered := []Country{}
	for _, c := range countries {
		if q != "" && !strings.Contains(strings.ToLower(c.Name.Common), q) &&
			!strings.Contains(strings.ToLower(c.Name.Official), q) {
			continue
		}
		if region != "" && strings.ToLower(c.Region) != region {
			continue
		}
		filtered = append(filtered, c)
	}

	switch sortBy {
	case "name":
		sort.Slice(filtered, func(i, j int) bool {
			// Descending order 
			if order == "desc" {
				return filtered[i].Name.Common > filtered[j].Name.Common
			}
			return filtered[i].Name.Common < filtered[j].Name.Common
		})
	case "population":
		sort.Slice(filtered, func(i, j int) bool {
			if order == "desc" {
				return filtered[i].Population > filtered[j].Population
			}
			return filtered[i].Population < filtered[j].Population
		})
	}

	total := len(filtered)
	end := offset + limit
	if end > total {
		end = total
	}
	if offset > total {
		offset = total
	}
	paged := filtered[offset:end]

	resp := map[string]interface{}{
		"total": total,
		"items": paged,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func main() {
	url := "https://restcountries.com/v3.1/independent?status=true"
	resp, err := http.Get(url)
	if err != nil {
		log.Fatal(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		if err := json.NewDecoder(resp.Body).Decode(&countries); err != nil {
			log.Fatal(err)
		}
		log.Printf("Loaded %d countries", len(countries)) 
	} else {
		log.Fatalf("Error: status code %d\n", resp.StatusCode)
	}

	http.HandleFunc("/healthz", healthz)
	http.HandleFunc("/items", getItems)
	fs := http.FileServer(http.Dir("./web"))
http.Handle("/", fs)
	log.Println("Server listening on :3030")
	http.ListenAndServe(":3030", nil)
}
