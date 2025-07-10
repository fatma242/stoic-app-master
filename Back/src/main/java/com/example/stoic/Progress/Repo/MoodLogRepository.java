package com.example.stoic.Progress.Repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.relational.core.sql.In;

import com.example.stoic.Progress.Model.MoodLog;

public interface MoodLogRepository extends JpaRepository<MoodLog, Integer> {
    List<MoodLog> findByUserIdOrderByTimestampAsc(String userId);
}
