package matching

import (
	"fmt"
	"math/rand"
	"sort"
	"testing"
	"time"

	"depthwise/engine/internal/orderbook"
)

func generateBenchmarkBatch(size int) []orderbook.OrderEvent {
	// Use a fixed seed for deterministic reproducible batches
	rand.Seed(42)
	var events []orderbook.OrderEvent
	
	activeIDs := make([]string, 0, size)
	seq := 1
	
	for i := 0; i < size; i++ {
		isCancel := rand.Float64() < 0.3 && len(activeIDs) > 0
		
		if isCancel {
			idx := rand.Intn(len(activeIDs))
			cancelID := activeIDs[idx]
			// remove from activeIDs
			activeIDs[idx] = activeIDs[len(activeIDs)-1]
			activeIDs = activeIDs[:len(activeIDs)-1]
			
			events = append(events, orderbook.OrderEvent{
				Seq:  seq,
				Type: "cancel",
				ID:   cancelID,
			})
		} else {
			id := fmt.Sprintf("O%d", seq)
			side := "buy"
			if rand.Float64() < 0.5 {
				side = "sell"
			}
			
			// 10% market orders, 90% limit orders
			var price int
			if rand.Float64() < 0.1 {
				if side == "buy" {
					price = 1000000 // Very high price for market buy
				} else {
					price = 1       // Very low price for market sell
				}
			} else {
				// Randomize price around 1000
				price = 990 + rand.Intn(21) // 990 to 1010
			}
			
			qty := 1 + rand.Intn(100)
			
			events = append(events, orderbook.OrderEvent{
				Seq:   seq,
				Type:  "new",
				ID:    id,
				Side:  side,
				Price: price,
				Qty:   qty,
			})
			activeIDs = append(activeIDs, id)
		}
		seq++
	}
	return events
}

func BenchmarkEngineThroughput(b *testing.B) {
	batchSize := 100000
	events := generateBenchmarkBatch(batchSize)
	
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		b.StopTimer()
		
		engine := NewEngine()
		eventsCh := make(chan orderbook.OrderEvent, batchSize)
		tradesCh := make(chan orderbook.Trade, batchSize)
		
		for _, ev := range events {
			eventsCh <- ev
		}
		close(eventsCh)
		
		go func() {
			for range tradesCh {
				// Drain trades to prevent engine from blocking
			}
		}()
		
		b.StartTimer()
		// Engine runs until eventsCh is closed and drained
		engine.Run(eventsCh, tradesCh, nil)
		b.StopTimer()
		
		close(tradesCh)
	}
	
	// Report orders per second based on how many we processed total
	b.ReportMetric(float64(b.N*batchSize)/b.Elapsed().Seconds(), "orders/sec")
}

func TestLatencyMeasurement(t *testing.T) {
	batchSize := 100000
	events := generateBenchmarkBatch(batchSize)
	
	engine := NewEngine()
	eventsCh := make(chan orderbook.OrderEvent, batchSize)
	tradesCh := make(chan orderbook.Trade, batchSize)
	resultsCh := make(chan int, batchSize)
	
	go func() {
		for range tradesCh {
			// Drain trades
		}
	}()
	
	go engine.Run(eventsCh, tradesCh, resultsCh)
	
	latencies := make([]time.Duration, 0, len(events))
	
	for _, ev := range events {
		start := time.Now()
		eventsCh <- ev
		<-resultsCh
		elapsed := time.Since(start)
		latencies = append(latencies, elapsed)
	}
	
	close(eventsCh)
	
	sort.Slice(latencies, func(i, j int) bool {
		return latencies[i] < latencies[j]
	})
	
	p50 := latencies[len(latencies)*50/100]
	p95 := latencies[len(latencies)*95/100]
	p99 := latencies[len(latencies)*99/100]
	
	fmt.Printf("\n--- Engine Latency Measurement ---\n")
	fmt.Printf("Batch Size: %d\n", batchSize)
	fmt.Printf("Composition: ~70%% new (10%% market, 90%% limit), ~30%% cancel\n")
	fmt.Printf("p50 Latency: %.2f µs\n", float64(p50.Nanoseconds())/1000.0)
	fmt.Printf("p95 Latency: %.2f µs\n", float64(p95.Nanoseconds())/1000.0)
	fmt.Printf("p99 Latency: %.2f µs\n", float64(p99.Nanoseconds())/1000.0)
	fmt.Printf("----------------------------------\n\n")
}
