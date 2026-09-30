package edu.ku.bookapi.controller;

import edu.ku.bookapi.model.Book;
import edu.ku.bookapi.model.BookInput;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/books")
public class BookController {

    // Must be a mutable list (not List.of) so PUT and DELETE can change it.
    private final List<Book> books = new ArrayList<>(List.of(
        new Book(1L, "Java Programming", "John Smith", 5),
        new Book(2L, "Web Development", "Sara Ahmad", 3),
        new Book(3L, "Database Systems", "Ali Khan", 4)
    ));

    @GetMapping
    public List<Book> getAllBooks() {
        return books;
    }

    // Optional extension from Lab 01: GET /api/v1/books/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return books.stream()
            .filter(b -> b.id().equals(id))
            .findFirst()
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Task A - PUT /api/v1/books/{bookId}
    @PutMapping("/{bookId}")
    public ResponseEntity<?> updateBook(
            @PathVariable Long bookId,
            @RequestBody BookInput input
    ) {
        for (int i = 0; i < books.size(); i++) {
            if (books.get(i).id().equals(bookId)) {
                // The original id is kept; only the other fields are replaced.
                Book updated = new Book(
                    bookId,
                    input.title(),
                    input.author(),
                    input.availableCopies()
                );
                books.set(i, updated);
                return ResponseEntity.ok(updated);          // 200 OK
            }
        }
        return ResponseEntity.notFound().build();            // 404 Not Found
    }

    // Task B - DELETE /api/v1/books/{bookId}
    @DeleteMapping("/{bookId}")
    public ResponseEntity<Void> deleteBook(
            @PathVariable Long bookId
    ) {
        boolean removed = books.removeIf(b -> b.id().equals(bookId));
        if (removed) {
            return ResponseEntity.noContent().build();       // 204 No Content
        }
        return ResponseEntity.notFound().build();            // 404 Not Found
    }
}
